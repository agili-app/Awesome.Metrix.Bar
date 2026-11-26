import { dashboardLinks, sortedDashboards } from "../catalog.ts";
import { baseLocale, dashboardPath, localePath, resolveLocalePath, type Locale } from "../i18n.ts";
import { registryLink } from "../metrix.ts";
import * as m from "../paraglide/messages.js";
import { siteURL, type Dashboard, type Manifest } from "../registry.ts";

export function escapeMarkdown(value: string): string {
  return value.replaceAll(/([\\`*_[\]<>])/g, "\\$1");
}

function fencedText(value: string): string {
  const runs = value.match(/`+/g) ?? [];
  const fence = "`".repeat(Math.max(3, ...runs.map((run) => run.length + 1)));
  return `${fence}text\n${value}\n${fence}`;
}

export function dashboardMarkdown(
  dashboard: Dashboard,
  manifest: Manifest,
  locale: Locale = baseLocale,
): string {
  const links = dashboardLinks(dashboard, manifest);
  return [
    `# ${escapeMarkdown(dashboard.name)}`,
    dashboard.description && escapeMarkdown(dashboard.description),
    `- ID: ${dashboard.id}\n- Version: ${dashboard.version}\n- SHA-256: ${dashboard.sha256}`,
    ...(["category", "author", "license"] as const).map(
      (key) => dashboard[key] && `- ${key}: ${escapeMarkdown(dashboard[key])}`,
    ),
    `[${m.install_in_app({}, { locale })}](${links.install})`,
    `[${m.download_bar({}, { locale })}](${siteURL(manifest, links.download)})`,
    m.install_requirement({}, { locale }),
    `## ${m.setup_heading({}, { locale })}`,
    dashboard.docs ? fencedText(dashboard.docs) : m.setup_fallback({}, { locale }),
    links.repository && `[GitHub](${links.repository})`,
    links.homepage && `[Homepage](${links.homepage})`,
    `[${m.dashboards({}, { locale })}](${siteURL(manifest, localePath("/", locale))})`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function dashboardList(manifest: Manifest, locale: Locale = baseLocale): string {
  return sortedDashboards(manifest)
    .map(
      (dashboard) =>
        `- [${escapeMarkdown(dashboard.name)}](${siteURL(manifest, dashboardPath(dashboard.id, locale))}): ${escapeMarkdown(dashboard.description ?? dashboard.id)}`,
    )
    .join("\n");
}

export function catalogMarkdown(manifest: Manifest, locale: Locale = baseLocale): string {
  return [
    `# ${escapeMarkdown(manifest.registry.name)}`,
    m.hero_description({}, { locale }),
    m.hero_details({}, { locale }),
    `[${m.add_registry({}, { locale })}](${registryLink(manifest.registryURL)})`,
    `${m.registry_url_label({}, { locale })}: ${manifest.registryURL}`,
    m.sort_description({}, { locale }),
    `## ${m.catalog_heading({}, { locale })}`,
    dashboardList(manifest, locale),
  ].join("\n\n");
}

export function markdownPage(manifest: Manifest, path: string): string | undefined {
  const resolved = resolveLocalePath(path);
  if (!resolved) return undefined;
  if (resolved.path === "/") return `${catalogMarkdown(manifest, resolved.locale)}\n`;
  if (!resolved.path.startsWith("/dashboards/")) return undefined;
  const id = resolved.path.slice("/dashboards/".length);
  if (!id || id.includes("/")) return undefined;
  const dashboard = manifest.registry.dashboards.find(
    (entry) => encodeURIComponent(entry.id) === id,
  );
  if (dashboard) return `${dashboardMarkdown(dashboard, manifest, resolved.locale)}\n`;
}
