import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import type { Manifest } from "vite-plus";
import generated from "../.generated/manifest.json";
import { createPageVerifier } from "../scripts/verify-page.ts";
import { PAGE_CACHE } from "../src/registry.ts";
import { head, html, scriptPath, scriptTag, url } from "./fixtures/page.ts";

const entry = "src/client/prefetch.ts";
const manifest = { [entry]: { file: scriptPath.slice(1), isEntry: true } } satisfies Manifest;
const stylesheet = () => new Response("body {}", { headers: { "Content-Type": "text/css" } });
const script = () => new Response("export {};", { headers: { "Content-Type": "text/javascript" } });

function withAssets(
  responses: Record<string, Response> = {},
  document = html,
  build: Manifest = manifest,
) {
  const assets: Record<string, Response> = {
    "/assets/site.css": stylesheet(),
    [scriptPath]: script(),
    "/.vite/manifest.json": Response.json(build),
    ...responses,
  };
  const fetch = vi.fn<typeof globalThis.fetch>(async (input, init) => {
    if (input instanceof URL && assets[input.pathname]) return assets[input.pathname]!.clone();
    return new Response(
      init?.method === "HEAD"
        ? null
        : document.replace("</head>", '<link rel="stylesheet" href="/assets/site.css"></head>'),
      { headers: { "Content-Type": "text/html", "Cache-Control": PAGE_CACHE } },
    );
  });
  vi.stubGlobal("fetch", fetch);
  return {
    fetch,
    verify: createPageVerifier({ ...generated, registryURL: `${url}dashboards/index.json` }, url),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe.each([
  ["stylesheet", "/assets/site.css", "text/css"],
  ["script", scriptPath, "text/javascript"],
] as const)("%s verification", (_, path, contentType) => {
  it.each([
    [404, contentType, "missing"],
    [200, "text/html", "<html>Error</html>"],
    [200, contentType, ""],
  ])("rejects an unavailable, invalid or empty response %#", async (status, mime, body) => {
    const { verify } = withAssets({
      [path]: new Response(body, { status, headers: { "Content-Type": mime } }),
    });
    await expect(verify("/", head)).rejects.toThrow();
  });

  it("checks each shared resource once", async () => {
    const { verify, fetch } = withAssets();
    await verify("/", head);
    await verify("/", head);
    expect(
      fetch.mock.calls.filter(([input]) => input instanceof URL && input.pathname === path),
    ).toHaveLength(1);
  });
});

describe("prefetch script verification", () => {
  it.each([html.replace(scriptTag, ""), html.replace("</head>", `${scriptTag}</head>`)])(
    "requires exactly one prefetch entry",
    async (document) => {
      const { verify } = withAssets({}, document);
      await expect(verify("/", head)).rejects.toThrow("expected one prefetch entry");
    },
  );

  it("checks MIME separately when one URL is used for both CSS and JavaScript", async () => {
    const document = html.replace("</head>", `<link rel="stylesheet" href="${scriptPath}"></head>`);
    const { verify } = withAssets({ [scriptPath]: stylesheet() }, document);
    await expect(verify("/", head)).rejects.toThrow();
  });

  it("requires the entry to agree with the build manifest", async () => {
    const { verify } = withAssets({}, html, { [entry]: { file: "assets/prefetch-other.js" } });
    await expect(verify("/", head)).rejects.toThrow("unexpected prefetch entry");
  });

  const modules: Manifest = {
    [entry]: { file: scriptPath.slice(1), dynamicImports: ["handler"] },
    handler: { file: "assets/handler-test.js", imports: [entry], dynamicImports: ["predictor"] },
    predictor: { file: "assets/predictor-test.js" },
  };

  it("verifies static and dynamic imports once, including cyclic graphs", async () => {
    const { verify, fetch } = withAssets(
      { "/assets/handler-test.js": script(), "/assets/predictor-test.js": script() },
      html,
      modules,
    );
    await verify("/", head);
    await verify("/", head);
    for (const path of [
      "/.vite/manifest.json",
      scriptPath,
      "/assets/handler-test.js",
      "/assets/predictor-test.js",
    ])
      expect(
        fetch.mock.calls.filter(([input]) => input instanceof URL && input.pathname === path),
      ).toHaveLength(1);
  });

  it.each([
    [404, "text/javascript", "missing"],
    [200, "text/html", "<html>Error</html>"],
    [200, "text/javascript", ""],
  ])("rejects an unavailable, invalid or empty dynamic module %#", async (status, mime, body) => {
    const { verify } = withAssets(
      {
        "/assets/handler-test.js": new Response(body, {
          status,
          headers: { "Content-Type": mime },
        }),
      },
      html,
      modules,
    );
    await expect(verify("/", head)).rejects.toThrow();
  });

  it("rejects a missing build module", async () => {
    const { verify } = withAssets({}, html, { [entry]: modules[entry]! });
    await expect(verify("/", head)).rejects.toThrow("Missing build module: handler");
  });
});
