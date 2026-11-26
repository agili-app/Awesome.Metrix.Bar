import assert from "node:assert/strict";
import { agentDocuments } from "../src/agents/documents.ts";
import { markdownPage } from "../src/agents/markdown.ts";
import { dashboardPath, locales, localePath } from "../src/i18n.ts";
import { PAGE_CACHE, type Manifest } from "../src/registry.ts";
import { get, runConcurrently, verifyCache } from "./http.ts";
import { sha256 } from "./registry.ts";

export async function verifyAgents(
  manifest: Manifest,
  origin: string,
  edgeCache: boolean,
): Promise<void> {
  await runConcurrently(
    Object.entries(await agentDocuments(manifest)),
    6,
    async ([path, document]) => {
      const url = new URL(path, origin);
      const response = await get(url);
      assert.equal(response.status, 200, `${path}: discovery failed`);
      assert.equal(response.headers.get("Content-Type"), document.contentType);
      assert.equal(response.headers.get("Cache-Control"), PAGE_CACHE);
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
      assert.equal(await response.text(), document.body, `${path}: stale discovery document`);
      const [head, post] = await Promise.all([
        get(url, { method: "HEAD" }),
        get(url, { method: "POST" }),
      ]);
      assert.equal(head.status, 200);
      assert.equal(head.headers.get("Content-Type"), document.contentType);
      assert.equal(await head.text(), "");
      assert.equal(post.status, 405);
      assert.equal(post.headers.get("Cache-Control"), "no-store");
      assert.equal(post.headers.get("Allow"), "GET, HEAD");
      if (edgeCache) await verifyCache(url, sha256(document.body));
    },
  );
  const skillIndex = await get(new URL("/.well-known/agent-skills/index.json", origin));
  const { skills } = (await skillIndex.json()) as {
    skills: { url: string; digest: string }[];
  };
  await runConcurrently(skills, 6, async (skill) => {
    const response = await get(new URL(skill.url, origin));
    assert.equal(skill.digest, `sha256:${sha256(new Uint8Array(await response.arrayBuffer()))}`);
  });
  const markdownRequest = { headers: { Accept: "text/markdown" } };
  const negotiationPaths = locales.flatMap((locale) => [
    localePath("/", locale),
    dashboardPath(manifest.registry.dashboards[0]!.id, locale),
  ]);
  await runConcurrently(negotiationPaths, 6, async (path) => {
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
  });
  await Promise.all([
    ...["/dashboards/missing-dashboard", "/it", "/.well-known/missing-agent"].map(async (path) => {
      const response = await get(new URL(path, origin), markdownRequest);
      assert.equal(response.status, 404, `${path}: missing page became Markdown`);
      assert.equal(response.headers.get("Cache-Control"), "no-store");
    }),
    (async () => {
      const post = await get(new URL("/", origin), { ...markdownRequest, method: "POST" });
      assert.equal(post.status, 405);
      assert.equal(post.headers.get("Cache-Control"), "no-store");
    })(),
  ]);
}
