import { createHash } from "node:crypto";
import { describe, expect, it } from "vite-plus/test";
import manifest from "../.generated/manifest.json";
import { agentDocuments, SKILL_PATH } from "../src/agents/documents.ts";
import { agentResponse, prefersMarkdown } from "../src/agents/http.ts";
import { markdownPage } from "../src/agents/markdown.ts";
import { dashboardLinks } from "../src/catalog.ts";
import { dashboardPath, locales, localePath } from "../src/i18n.ts";

const documents = await agentDocuments(manifest);

describe("agent discovery", () => {
  it("publishes a discoverable skill with a digest of its exact response bytes", () => {
    const index = JSON.parse(documents["/.well-known/agent-skills/index.json"]!.body);
    const skill = documents[index.skills[0].url]!;
    expect(index.skills[0].digest).toBe(
      `sha256:${createHash("sha256").update(skill.body).digest("hex")}`,
    );
    expect(index.skills[0].url).toBe(SKILL_PATH);
    expect(skill.body).toContain(manifest.registryURL);
    expect(skill.body).toContain("name: metrix-dashboards");
  });

  it("links the API catalog to a real read-only API and its OpenAPI description", () => {
    const catalog = JSON.parse(documents["/.well-known/api-catalog"]!.body);
    const api = catalog.linkset[0];
    const description = new URL(api["service-desc"][0].href).pathname;
    const openapi = JSON.parse(documents[description]!.body);
    expect(api.anchor).toBe(manifest.registryURL);
    expect(openapi.openapi).toBe("3.1.0");
    expect(openapi.security).toEqual([]);
    expect(Object.keys(openapi.paths)).toContain("/dashboards/index.json");
    const ard = JSON.parse(documents["/.well-known/ai-catalog.json"]!.body);
    expect(new URL(ard.entries[0].url).pathname).toBe(SKILL_PATH);
    expect(ard.entries[0].representativeQueries.length).toBeGreaterThanOrEqual(2);
  });

  it("includes every published dashboard and its original setup notes", () => {
    for (const dashboard of manifest.registry.dashboards) {
      const full = documents["/llms-full.txt"]!.body;
      expect(full).toContain(dashboard.sha256);
      expect(full).toContain(dashboardLinks(dashboard, manifest).install);
      if (dashboard.docs) expect(full).toContain(dashboard.docs);
      expect(documents["/llms.txt"]!.body).toContain(`/dashboards/${dashboard.id}`);
    }
  });

  it("keeps discovery links intact when metadata contains Markdown headings", async () => {
    const custom = {
      ...manifest,
      registry: { ...manifest.registry, name: "Metrics ## Catalog" },
    };
    const documents = await agentDocuments(custom);
    for (const dashboard of custom.registry.dashboards)
      expect(documents["/llms.txt"]!.body).toContain(`/dashboards/${dashboard.id}`);
  });

  it("supports GET and HEAD and refuses writes without caching errors", async () => {
    for (const document of Object.values(documents)) {
      const get = agentResponse(document);
      expect(get.status).toBe(200);
      expect(get.headers.get("Access-Control-Allow-Origin")).toBe("*");
      expect(await get.text()).toBe(document.body);
      const head = agentResponse(document, "HEAD");
      expect(head.status).toBe(200);
      expect(head.headers).toEqual(get.headers);
      expect(await head.text()).toBe("");
      const post = agentResponse(document, "POST");
      expect(post.status).toBe(405);
      expect(post.headers.get("Cache-Control")).toBe("no-store");
      expect(post.headers.get("Allow")).toBe("GET, HEAD");
    }
  });
});

describe("Markdown pages", () => {
  it.each(locales)("serves the actual catalog and detail pages in %s", (locale) => {
    const catalog = markdownPage(manifest, localePath("/", locale));
    expect(catalog).toContain(manifest.registryURL);
    for (const dashboard of manifest.registry.dashboards) {
      expect(catalog).toContain(dashboardPath(dashboard.id, locale));
      const page = markdownPage(manifest, dashboardPath(dashboard.id, locale));
      expect(page).toContain(dashboard.sha256);
      expect(page).toContain(dashboardLinks(dashboard, manifest).install);
      if (dashboard.docs) expect(page).toContain(dashboard.docs);
    }
  });

  it("does not turn missing pages, registry downloads, or unsupported locales into Markdown", () => {
    for (const path of ["/dashboards/missing", "/dashboards/index.json", "/it", "/en", "/llms.txt"])
      expect(markdownPage(manifest, path)).toBeUndefined();
  });

  it.each([
    ["", false],
    ["*/*", false],
    ["text/html,application/xhtml+xml,*/*;q=0.8", false],
    ["text/markdown", true],
    ["TEXT/MARKDOWN; charset=utf-8", true],
    ["text/markdown,text/html", true],
    ["text/markdown;q=0.5,text/html;q=1", false],
    ["text/markdown;q=0,*/*", false],
    ["text/markdown;q=0.1,text/*;q=0.2", false],
    ["text/markdown;q=0.8,text/html;q=0.5", true],
    ["text/html,text/markdown", false],
    ["text/markdown ; q=1,text/html;q=0.5", true],
    ["text/markdown;q=0.8,text/markdown;q=0.1,text/html;q=0.5", true],
    ["text/markdown; charset=utf-8", true],
    ["text/markdown;charset=iso-8859-1,text/html;q=0.2", false],
  ])("negotiates %s as Markdown: %s", (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });
});
