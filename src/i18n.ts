import { baseLocale, isLocale, locales, localizeHref, type Locale } from "./paraglide/runtime.js";

export { baseLocale, isLocale, locales, type Locale } from "./paraglide/runtime.js";

export const prefixedLocales = locales.filter((locale) => locale !== baseLocale);

export const languageNames: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  pt: "Português",
};

export function parsePrefixedLocale(value: string | undefined): Locale | undefined {
  return value && isLocale(value) && value !== baseLocale ? value : undefined;
}

export function resolveLocalePath(path: string): { locale: Locale; path: string } | undefined {
  if (path === "/") return { locale: baseLocale, path: "/" };
  const slash = path.indexOf("/", 1);
  const firstSegment = slash === -1 ? path.slice(1) : path.slice(1, slash);
  if (firstSegment === baseLocale) return undefined;
  const prefixed = parsePrefixedLocale(firstSegment);
  if (prefixed) {
    return { locale: prefixed, path: slash === -1 ? "/" : path.slice(slash) };
  }
  return { locale: baseLocale, path };
}

export function localePath(path: string, locale: Locale = baseLocale): string {
  return localizeHref(path, { locale });
}

export function dashboardPath(id: string, locale: Locale = baseLocale): string {
  return localePath(`/dashboards/${encodeURIComponent(id)}`, locale);
}
