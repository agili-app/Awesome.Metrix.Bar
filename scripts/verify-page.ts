import assert from "node:assert/strict";
import type { Manifest as ViteManifest } from "vite-plus";
import type { HeadDescriptor } from "void";
import type { Manifest } from "../src/registry.ts";
import { PAGE_CACHE } from "../src/registry.ts";
import { siteURL } from "../src/seo.ts";
import { get, verifyCache } from "./http.ts";
import { isPrefetchScript, parsePage } from "./html.ts";
import { sha256 } from "./registry.ts";

export function createPageVerifier(
  manifest: Manifest,
  origin: string,
  edgeCache = false,
  development = false,
) {
  const assets = new Map<string, Promise<void>>();
  let buildPromise: Promise<ViteManifest> | undefined;

  function loadBuildManifest(): Promise<ViteManifest> {
    if (!buildPromise) {
      buildPromise = (async () => {
        const response = await get(new URL("/.vite/manifest.json", origin));
        assert.equal(response.status, 200, "Build manifest request failed");
        return response.json<ViteManifest>();
      })();
    }
    return buildPromise;
  }

  function verifyAsset(href: string, page: URL, kind: "stylesheet" | "script"): Promise<void> {
    const url = new URL(href, page);
    assert.equal(url.origin, page.origin, `${page.pathname}: cross-origin ${kind}`);
    const key = `${kind}:${url.href}`;
    const existing = assets.get(key);
    if (existing) return existing;
    const pending = (async () => {
      const response = await get(url);
      assert.equal(response.status, 200, `${url.pathname}: ${kind} request failed`);
      assert.match(
        response.headers.get("Content-Type") ?? "",
        kind === "stylesheet" ? /^text\/css(?:;|$)/i : /^(?:text|application)\/javascript(?:;|$)/i,
      );
      assert((await response.arrayBuffer()).byteLength, `${url.pathname}: empty ${kind}`);
    })();
    assets.set(key, pending);
    return pending;
  }

  return async (path: string, head: HeadDescriptor) => {
    const url = new URL(path, origin);
    const response = await get(url);
    assert.equal(response.status, 200, `${path}: page request failed`);
    assert.match(response.headers.get("Content-Type") ?? "", /^text\/html/);
    assert.equal(response.headers.get("Cache-Control"), PAGE_CACHE);
    const html = await response.text();
    const page = parsePage(html, head, siteURL(manifest, path), development);
    const links = page('link[rel="stylesheet"]');
    if (!development) assert(links.length, `${path}: missing stylesheet`);
    const checks: Promise<void>[] = [];
    for (const link of links.toArray()) {
      const href = page(link).attr("href");
      assert(href, `${path}: missing stylesheet URL`);
      checks.push(verifyAsset(href, url, "stylesheet"));
    }
    const entries = page('script[type="module"][src]').filter((_, node) =>
      isPrefetchScript(page(node).attr("src") ?? "", development),
    );
    assert.equal(entries.length, 1, `${path}: expected one prefetch entry`);
    const src = entries.attr("src")!;
    if (development) {
      checks.push(verifyAsset(src, url, "script"));
    } else {
      checks.push(
        (async () => {
          const build = await loadBuildManifest();
          const entry = "src/client/prefetch.ts";
          assert(build[entry], "Missing prefetch build entry");
          assert.equal(src, `/${build[entry].file}`, `${path}: unexpected prefetch entry`);
          const visited = new Set<string>();
          async function verifyModule(key: string): Promise<void> {
            if (visited.has(key)) return;
            visited.add(key);
            const chunk = build[key];
            assert(chunk, `Missing build module: ${key}`);
            await verifyAsset(`/${chunk.file}`, url, "script");
            await Promise.all(
              [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])].map((dependency) =>
                verifyModule(dependency),
              ),
            );
          }
          await verifyModule(entry);
        })(),
      );
    }
    checks.push(
      (async () => {
        const responseHead = await get(url, { method: "HEAD" });
        assert.equal(responseHead.status, 200, `${path}: HEAD failed`);
        assert.equal(
          (await responseHead.arrayBuffer()).byteLength,
          0,
          `${path}: HEAD returned a body`,
        );
      })(),
    );
    if (edgeCache) checks.push(verifyCache(url, sha256(html)));
    await Promise.all(checks);
    return page;
  };
}
