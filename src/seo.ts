import type { HeadDescriptor } from "void";
import { dashboardPreviews } from "./catalog.ts";
import { baseLocale, dashboardPath, locales, localePath, type Locale } from "./i18n.ts";
import * as m from "./paraglide/messages.js";
import { siteURL, type Dashboard, type Manifest } from "./registry.ts";
import { dashboardStructuredData, homeStructuredData } from "./structured-data.ts";

export { siteURL };

interface PreviewMeta {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export function languageAlternates(manifest: Manifest, path: string) {
  return [
    ...locales.map((language) => ({
      hreflang: language,
      href: siteURL(manifest, localePath(path, language)),
    })),
    { hreflang: "x-default", href: siteURL(manifest, path) },
  ];
}

const socialLocales: Record<Locale, string> = {
  en: "en_US",
  "zh-CN": "zh_CN",
  "zh-TW": "zh_TW",
  ja: "ja_JP",
  ko: "ko_KR",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  pt: "pt_PT",
};

function buildHead(
  manifest: Manifest,
  path: string,
  title: string,
  description: string,
  structuredData: object,
  locale: Locale,
  preview?: PreviewMeta,
): HeadDescriptor {
  const url = siteURL(manifest, localePath(path, locale));
  return {
    title,
    htmlAttrs: { lang: locale, dir: "ltr" },
    meta: [
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: manifest.registry.name },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:locale", content: socialLocales[locale] },
      ...(preview
        ? [
            { property: "og:image", content: preview.url },
            { property: "og:image:width", content: String(preview.width) },
            { property: "og:image:height", content: String(preview.height) },
            { property: "og:image:alt", content: preview.alt },
          ]
        : []),
      { name: "twitter:card", content: preview ? "summary_large_image" : "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(preview
        ? [
            { name: "twitter:image", content: preview.url },
            { name: "twitter:image:alt", content: preview.alt },
          ]
        : []),
    ],
    link: [
      { rel: "canonical", href: url },
      ...languageAlternates(manifest, path).map((alternate) => ({
        rel: "alternate",
        ...alternate,
      })),
    ],
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(structuredData).replaceAll("<", "\\u003c"),
      },
    ],
  };
}

export function homeHead(manifest: Manifest, locale: Locale = baseLocale): HeadDescriptor {
  const title = m.home_title({ site: manifest.registry.name }, { locale });
  const description = m.home_description({}, { locale });
  return buildHead(
    manifest,
    "/",
    title,
    description,
    homeStructuredData(manifest, locale, title, description),
    locale,
  );
}

export function dashboardHead(
  dashboard: Dashboard,
  manifest: Manifest,
  locale: Locale = baseLocale,
): HeadDescriptor {
  const path = dashboardPath(dashboard.id);
  const duplicateName = manifest.registry.dashboards.some(
    (entry) => entry.id !== dashboard.id && entry.name === dashboard.name,
  );
  const label = duplicateName ? `${dashboard.name} (${dashboard.id})` : dashboard.name;
  const title = `${label} | ${manifest.registry.name}`;
  const description =
    dashboard.description ?? m.dashboard_fallback_description({ name: dashboard.name }, { locale });
  const firstPreview = dashboardPreviews(dashboard, manifest)[0];
  const preview = firstPreview && {
    url: siteURL(manifest, firstPreview.path),
    width: firstPreview.width,
    height: firstPreview.height,
    alt: firstPreview.alt ?? m.preview_alt({ name: dashboard.name, index: 1 }, { locale }),
  };
  return buildHead(
    manifest,
    path,
    title,
    description,
    dashboardStructuredData(dashboard, manifest, locale, title, description),
    locale,
    preview,
  );
}
