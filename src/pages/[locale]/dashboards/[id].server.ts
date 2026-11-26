import { defineHandler, defineHead, type InferProps } from "void/handler";
import type { PageParams } from "void/routes";
import manifest from "../../../../.generated/manifest.json";
import { parsePrefixedLocale, prefixedLocales } from "../../../i18n.ts";
import { dashboardHead } from "../../../seo.ts";

export const loader = defineHandler((context) => {
  const locale = parsePrefixedLocale(context.req.param("locale"));
  if (!locale) return context.notFound();
  const dashboard = manifest.registry.dashboards.find(({ id }) => id === context.req.param("id"));
  return dashboard ? { dashboard, locale } : context.notFound();
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_context, { dashboard, locale }) =>
  dashboardHead(dashboard, manifest, locale),
);

export function getPrerenderPaths(): PageParams<"/[locale]/dashboards/[id]">[] {
  return prefixedLocales.flatMap((locale) =>
    manifest.registry.dashboards.map(({ id }) => ({ locale, id })),
  );
}
