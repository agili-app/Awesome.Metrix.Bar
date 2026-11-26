import { sortedDashboards } from "./catalog.ts";
import { dashboardPath, locales, localePath, type Locale } from "./i18n.ts";
import * as m from "./paraglide/messages.js";
import { siteURL, type Dashboard, type Manifest } from "./registry.ts";

function websiteNode(manifest: Manifest) {
  return {
    "@type": "WebSite",
    "@id": `${siteURL(manifest)}#website`,
    name: manifest.registry.name,
    url: siteURL(manifest),
    inLanguage: [...locales],
  };
}

export function homeStructuredData(
  manifest: Manifest,
  locale: Locale,
  title: string,
  description: string,
) {
  const url = siteURL(manifest, localePath("/", locale));
  const website = `${siteURL(manifest)}#website`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteNode(manifest),
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": website },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: manifest.registry.dashboards.length,
          itemListElement: sortedDashboards(manifest).map((dashboard, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: dashboard.name,
            url: siteURL(manifest, dashboardPath(dashboard.id, locale)),
          })),
        },
      },
    ],
  };
}

export function dashboardStructuredData(
  dashboard: Dashboard,
  manifest: Manifest,
  locale: Locale,
  title: string,
  description: string,
) {
  const path = dashboardPath(dashboard.id);
  const url = siteURL(manifest, dashboardPath(dashboard.id, locale));
  const application = `${siteURL(manifest, path)}#dashboard`;
  const breadcrumb = `${url}#breadcrumb`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": application,
        url,
        mainEntityOfPage: { "@id": url },
        name: dashboard.name,
        description,
        softwareVersion: dashboard.version,
        softwareRequirements: "Metrix.Bar",
        applicationCategory: dashboard.category,
        downloadUrl: new URL(dashboard.file, manifest.registryURL).href,
        author: dashboard.author
          ? {
              "@type": "Person",
              name: dashboard.author,
              url: `https://github.com/${encodeURIComponent(dashboard.author)}`,
            }
          : undefined,
        isBasedOn: dashboard.source,
        license:
          dashboard.license && dashboard.license !== "UNLICENSED"
            ? `https://spdx.org/licenses/${encodeURIComponent(dashboard.license)}.html`
            : undefined,
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumb,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: m.dashboards({}, { locale }),
            item: siteURL(manifest, localePath("/", locale)),
          },
          { "@type": "ListItem", position: 2, name: dashboard.name, item: url },
        ],
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: { "@id": `${siteURL(manifest)}#website` },
        mainEntity: { "@id": application },
        breadcrumb: { "@id": breadcrumb },
      },
      websiteNode(manifest),
    ],
  };
}
