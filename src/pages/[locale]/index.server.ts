import { defineHandler, defineHead, type InferProps } from "void/handler";
import type { PageParams } from "void/routes";
import manifest from "../../../.generated/manifest.json";
import { parsePrefixedLocale, prefixedLocales } from "../../i18n.ts";
import { homeHead } from "../../seo.ts";

export const loader = defineHandler((context) => {
  const locale = parsePrefixedLocale(context.req.param("locale"));
  return locale ? { locale } : context.notFound();
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_context, { locale }) => homeHead(manifest, locale));

export function getPrerenderPaths(): PageParams<"/[locale]">[] {
  return prefixedLocales.map((locale) => ({ locale }));
}
