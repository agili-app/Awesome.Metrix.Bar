import { sortedDashboards } from "../catalog.ts";
import { sha256Hex } from "../crypto.ts";
import { locales } from "../i18n.ts";
import { registryLink } from "../metrix.ts";
import { siteURL, type Manifest } from "../registry.ts";
import { catalogMarkdown, dashboardList, dashboardMarkdown, escapeMarkdown } from "./markdown.ts";

export const SKILL_PATH = "/.well-known/agent-skills/metrix-dashboards/SKILL.md";

const SITE_DESCRIPTION =
  "Community dashboards for Metrix.Bar on macOS, Windows, and Linux (experimental).";

export interface AgentDocument {
  body: string;
  contentType: string;
}

function jsonDocument(value: unknown, contentType = "application/json"): AgentDocument {
  return {
    body: `${JSON.stringify(value, null, 2)}\n`,
    contentType: `${contentType}; charset=utf-8`,
  };
}

export async function agentDocuments(manifest: Manifest): Promise<Record<string, AgentDocument>> {
  const skill = `---
name: metrix-dashboards
description: Find Metrix.Bar dashboards, read setup requirements, and obtain verified downloads and registry-aware installation links.
---

# Metrix.Bar dashboards

1. Read [the registry](${manifest.registryURL}) for dashboard IDs, descriptions, versions, SHA-256 hashes, and relative file paths. Public resources require no authentication.
2. Resolve each file relative to the registry URL. Download the bytes from this site and verify their SHA-256 against the registry before using them.
3. Follow a dashboard's catalog link in [llms.txt](${siteURL(manifest, "/llms.txt")}) to read its page. Send \`Accept: text/markdown\` for Markdown, or read [all setup notes](${siteURL(manifest, "/llms-full.txt")}). Preserve upstream author and license information; UNLICENSED grants no upstream license.
4. Check setup notes for credentials, permissions, and any required local collector. The registry does not execute collectors or guarantee runtime API availability.
5. Offer [Add registry](${registryLink(manifest.registryURL)}) or the page's registry-aware install link. Opening a link requires Metrix.Bar; the user confirms permissions and updates in the app. A downloaded .bar file is also available.

In WebMCP-capable browsers, UI SDK exposes \`snapshot\`, \`query\`, and \`act\` for the page's Add registry, Install, and Download controls. Use their accessible labels in the current page language. Installation links open the local app; reading the catalog and downloading a file do not install it.

The site supports ${locales.join(", ")}. English paths are unprefixed; other pages use /<locale> and /<locale>/dashboards/<id>. Registry and download URLs are unprefixed. Dashboard descriptions and setup notes retain their original language.
`;
  const digest = await sha256Hex(skill);
  return {
    "/llms.txt": {
      body: [
        `# ${escapeMarkdown(manifest.registry.name)}\n\n> ${SITE_DESCRIPTION}`,
        "Dashboard descriptions and setup notes retain their upstream language. Follow setup requirements and upstream licenses; downloads do not install dashboards.",
        "## Catalog",
        dashboardList(manifest),
        `## Resources\n\n- [Registry](${manifest.registryURL}): Official Metrix.Bar registry JSON.\n- [Full documentation](${siteURL(manifest, "/llms-full.txt")}): All dashboard metadata and setup notes.\n- [Agent skill](${siteURL(manifest, SKILL_PATH)}): Discovery, verification, and installation workflow.\n- [API description](${siteURL(manifest, "/openapi.json")}): Read-only public endpoints.`,
        "",
      ].join("\n\n"),
      contentType: "text/plain; charset=utf-8",
    },
    "/llms-full.txt": {
      body: `${catalogMarkdown(manifest)}\n\n${sortedDashboards(manifest)
        .map((dashboard) => dashboardMarkdown(dashboard, manifest))
        .join("\n\n---\n\n")}\n`,
      contentType: "text/plain; charset=utf-8",
    },
    [SKILL_PATH]: { body: skill, contentType: "text/markdown; charset=utf-8" },
    "/.well-known/agent-skills/index.json": jsonDocument({
      $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
      skills: [
        {
          name: "metrix-dashboards",
          type: "skill-md",
          description:
            "Find Metrix.Bar dashboards, check setup requirements, and obtain verified downloads and installation links.",
          url: SKILL_PATH,
          digest: `sha256:${digest}`,
        },
      ],
    }),
    "/.well-known/api-catalog": jsonDocument(
      {
        linkset: [
          {
            anchor: manifest.registryURL,
            "service-desc": [
              {
                href: siteURL(manifest, "/openapi.json"),
                type: "application/vnd.oai.openapi+json",
              },
            ],
            "service-doc": [{ href: siteURL(manifest, "/llms-full.txt"), type: "text/plain" }],
          },
        ],
      },
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    ),
    "/openapi.json": jsonDocument(
      {
        openapi: "3.1.0",
        info: { title: manifest.registry.name, version: "1.0.0", description: SITE_DESCRIPTION },
        servers: [{ url: siteURL(manifest).replace(/\/$/, "") }],
        security: [],
        paths: {
          "/dashboards/index.json": {
            get: {
              operationId: "getDashboardRegistry",
              summary:
                "List dashboard metadata, versions, SHA-256 hashes, and relative download paths",
              responses: {
                "200": {
                  description: "Official Metrix.Bar registry",
                  content: {
                    "application/json": { schema: { $ref: manifest.registry.$schema } },
                  },
                },
              },
            },
          },
          "/llms-full.txt": {
            get: {
              operationId: "getDashboardDocumentation",
              summary: "Read all dashboard setup notes and installation links",
              responses: {
                "200": {
                  description: "Dashboard documentation",
                  content: { "text/plain": { schema: { type: "string" } } },
                },
              },
            },
          },
        },
      },
      "application/vnd.oai.openapi+json",
    ),
    "/.well-known/ai-catalog.json": jsonDocument({
      specVersion: "1.0",
      host: { displayName: manifest.registry.name, identifier: siteURL(manifest) },
      entries: [
        {
          identifier: `urn:air:${new URL(manifest.registryURL).hostname}:skill:metrix-dashboards`,
          displayName: "Metrix.Bar dashboard skill",
          type: "text/markdown",
          url: siteURL(manifest, SKILL_PATH),
          representativeQueries: [
            "Find a Metrix.Bar dashboard for monitoring servers",
            "Check dashboard setup requirements and get a verified download",
          ],
        },
      ],
    }),
  };
}
