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
  const assets = new Set<string>();
  let build: ViteManifest | undefined;

  async function verifyAsset(href: string, page: URL, kind: "stylesheet" | "script") {
    const url = new URL(href, page);
    assert.equal(url.origin, page.origin, `${page.pathname}: cross-origin ${kind}`);
    const key = `${kind}:${url.href}`;
    if (assets.has(key)) return;
    const response = await get(url);
    assert.equal(response.status, 200, `${url.pathname}: ${kind} request failed`);
    assert.match(
      response.headers.get("Content-Type") ?? "",
      kind === "stylesheet" ? /^text\/css(?:;|$)/i : /^(?:text|application)\/javascript(?:;|$)/i,
    );
    assert((await response.arrayBuffer()).byteLength, `${url.pathname}: empty ${kind}`);
    assets.add(key);
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
    for (const link of links.toArray()) {
      const href = page(link).attr("href");
      assert(href, `${path}: missing stylesheet URL`);
      await verifyAsset(href, url, "stylesheet");
    }
    const entries = page('script[type="module"][src]').filter((_, node) =>
      isPrefetchScript(page(node).attr("src") ?? "", development),
    );
    assert.equal(entries.length, 1, `${path}: expected one prefetch entry`);
    const src = entries.attr("src")!;
    if (development) {
      await verifyAsset(src, url, "script");
    } else {
      if (!build) {
        const response = await get(new URL("/.vite/manifest.json", origin));
        assert.equal(response.status, 200, "Build manifest request failed");
        build = await response.json<ViteManifest>();
      }
      const entry = "src/client/prefetch.ts";
      assert(build[entry], "Missing prefetch build entry");
      assert.equal(src, `/${build[entry].file}`, `${path}: unexpected prefetch entry`);
      const visited = new Set<string>();
      async function verifyModule(key: string): Promise<void> {
        if (visited.has(key)) return;
        visited.add(key);
        const chunk = build![key];
        assert(chunk, `Missing build module: ${key}`);
        await verifyAsset(`/${chunk.file}`, url, "script");
        for (const dependency of [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])])
          await verifyModule(dependency);
      }
      await verifyModule(entry);
    }
    const responseHead = await get(url, { method: "HEAD" });
    assert.equal(responseHead.status, 200, `${path}: HEAD failed`);
    assert.equal((await responseHead.arrayBuffer()).byteLength, 0, `${path}: HEAD returned a body`);
    if (edgeCache) await verifyCache(url, sha256(html));
    return page;
  };
}
