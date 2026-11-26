import type { HeadDescriptor } from "void";
import { baseLocale, dashboardPath, locales, localePath, type Locale } from "./i18n.ts";
import * as m from "./paraglide/messages.js";
import { siteURL, type Dashboard, type Manifest } from "./registry.ts";
import { dashboardStructuredData, homeStructuredData } from "./structured-data.ts";

export { siteURL };

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
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
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
  return buildHead(
    manifest,
    path,
    title,
    description,
    dashboardStructuredData(dashboard, manifest, locale, title, description),
    locale,
  );
}
