import { load } from "cheerio";
import { describe, expect, it } from "vite-plus/test";
import generated from "../.generated/manifest.json";
import { parsePage, verifyDashboard } from "../scripts/html.ts";
import { installLink } from "../src/metrix.ts";
import { head, html, scriptPath, url } from "./fixtures/page.ts";

describe("page verification", () => {
  it("compares decoded titles and metadata", () => {
    expect(parsePage(html, head, url)("title").text()).toBe("Servers & usage");
  });

  it.each([
    html.replace("</head>", `<link rel="canonical" href="${url}"></head>`),
    html.replace("</head>", `<meta property="og:url" content="${url}"></head>`),
    html.replace(
      `property="og:url" content="${url}"`,
      'property="og:url" content="https://wrong.example/"',
    ),
    html.replace('"@type":"WebSite"', '"@type":"Person"'),
  ])("rejects duplicate or incorrect metadata", (invalid) => {
    expect(() => parsePage(invalid, head, url)).toThrow();
  });

  it("allows Vite tools only in development and rejects executable application scripts", () => {
    const developmentHTML = html.replace(scriptPath, "/src/client/prefetch.ts");
    const development = developmentHTML.replace(
      "</body>",
      '<script type="module" src="/@vite/client"></script></body>',
    );
    expect(() => parsePage(development, head, url, true)).not.toThrow();
    expect(() => parsePage(development, head, url)).toThrow("unexpected browser JavaScript");
    for (const script of [
      '<script>console.log("/@vite/client")</script>',
      '<script type="module" src="/assets/other-12345678.js"></script>',
      '<script type="module" src="https://evil.example/assets/prefetch-12345678.js"></script>',
      `<script src="${scriptPath}"></script>`,
      `<script type="module" src="${scriptPath}">console.log("app")</script>`,
      '<script type="module">/* from "/@react-refresh" */ console.log("app")</script>',
    ]) {
      expect(() =>
        parsePage(developmentHTML.replace("</body>", `${script}</body>`), head, url, true),
      ).toThrow("unexpected browser JavaScript");
    }
  });
  it("allows the source entry only in development", () => {
    const development = html.replace(scriptPath, "/src/client/prefetch.ts");
    expect(() => parsePage(development, head, url, true)).not.toThrow();
    expect(() => parsePage(development, head, url)).toThrow("unexpected browser JavaScript");
  });
});

describe("dashboard content verification", () => {
  const dashboard = {
    ...generated.registry.dashboards[0]!,
    name: "Sample",
    description: "Essential description",
    docs: "Required setup instructions",
  };
  const registryURL = generated.registryURL;
  const body = `<main><h1>${dashboard.name}</h1><p>${dashboard.description}</p><p>${dashboard.docs}</p><a href="${installLink(dashboard.id, registryURL)}">Install</a><a download href="${new URL(dashboard.file, registryURL).pathname}">Download</a></main>`;

  it("accepts complete visible content and named actions", () => {
    expect(() => verifyDashboard(load(body), dashboard, registryURL)).not.toThrow();
  });

  it.each([
    "Sample",
    "Essential description",
    "Required setup instructions",
    ">Install<",
    ">Download<",
  ])("rejects missing content %s", (content) => {
    const invalid = body.replace(content, content.startsWith(">") ? "><" : "");
    expect(() => verifyDashboard(load(invalid), dashboard, registryURL)).toThrow();
  });
});
