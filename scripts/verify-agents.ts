import assert from "node:assert/strict";
import { agentDocuments } from "../src/agents/documents.ts";
import { markdownPage } from "../src/agents/markdown.ts";
import { dashboardPath, locales, localePath } from "../src/i18n.ts";
import { PAGE_CACHE, type Manifest } from "../src/registry.ts";
import { get, verifyCache } from "./http.ts";
import { sha256 } from "./registry.ts";

export async function verifyAgents(
  manifest: Manifest,
  origin: string,
  edgeCache: boolean,
): Promise<void> {
  for (const [path, document] of Object.entries(await agentDocuments(manifest))) {
    const url = new URL(path, origin);
    const response = await get(url);
    assert.equal(response.status, 200, `${path}: discovery failed`);
    assert.equal(response.headers.get("Content-Type"), document.contentType);
    assert.equal(response.headers.get("Cache-Control"), PAGE_CACHE);
    assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
    assert.equal(await response.text(), document.body, `${path}: stale discovery document`);
    const head = await get(url, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("Content-Type"), document.contentType);
    assert.equal(await head.text(), "");
    const post = await get(url, { method: "POST" });
    assert.equal(post.status, 405);
    assert.equal(post.headers.get("Cache-Control"), "no-store");
    assert.equal(post.headers.get("Allow"), "GET, HEAD");
    if (edgeCache) await verifyCache(url, sha256(document.body));
  }
  const skillIndex = await get(new URL("/.well-known/agent-skills/index.json", origin));
  const { skills } = (await skillIndex.json()) as {
    skills: { url: string; digest: string }[];
  };
  for (const skill of skills) {
    const response = await get(new URL(skill.url, origin));
    assert.equal(skill.digest, `sha256:${sha256(new Uint8Array(await response.arrayBuffer()))}`);
  }
  const markdownRequest = { headers: { Accept: "text/markdown" } };
  for (const locale of locales) {
    for (const path of [
      localePath("/", locale),
      dashboardPath(manifest.registry.dashboards[0]!.id, locale),
    ]) {
      const url = new URL(path, origin);
      const markdown = await get(url, markdownRequest);
      assert.equal(markdown.status, 200, `${path}: Markdown failed`);
      assert.match(markdown.headers.get("Content-Type") ?? "", /^text\/markdown/);
      assert.match(markdown.headers.get("Vary") ?? "", /\bAccept\b/i);
      assert.equal(markdown.headers.get("Content-Signal"), "search=yes, ai-input=yes");
      assert.equal(markdown.headers.get("Cache-Control"), PAGE_CACHE);
      assert.equal(await markdown.text(), markdownPage(manifest, path));
      const head = await get(url, { ...markdownRequest, method: "HEAD" });
      assert.equal(head.status, 200);
      assert.match(head.headers.get("Content-Type") ?? "", /^text\/markdown/);
      assert.equal(await head.text(), "");
      const html = await get(url, {
        headers: { Accept: "text/html,text/markdown;q=0" },
      });
      assert.equal(html.status, 200);
      assert.match(html.headers.get("Content-Type") ?? "", /^text\/html/);
      assert.match(html.headers.get("Vary") ?? "", /\bAccept\b/i);
      assert.match(html.headers.get("Link") ?? "", /rel="api-catalog"/);
      assert.equal(html.headers.get("Content-Signal"), "search=yes, ai-input=yes");
      assert.match(await html.text(), /<html\b/);
      const repeated = await get(url, markdownRequest);
      assert.match(repeated.headers.get("Content-Type") ?? "", /^text\/markdown/);
      assert.equal(await repeated.text(), markdownPage(manifest, path));
      if (edgeCache) await verifyCache(url, sha256(markdownPage(manifest, path)!), markdownRequest);
    }
  }
  for (const path of ["/dashboards/missing-dashboard", "/it", "/.well-known/missing-agent"]) {
    const response = await get(new URL(path, origin), markdownRequest);
    assert.equal(response.status, 404, `${path}: missing page became Markdown`);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
  }
  const post = await get(new URL("/", origin), { ...markdownRequest, method: "POST" });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get("Cache-Control"), "no-store");
}
