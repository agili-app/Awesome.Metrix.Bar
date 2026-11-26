import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { css, cx } from "../../styled-system/css";
import { flex, grid } from "../../styled-system/patterns";
import { button, textLink } from "../../styled-system/recipes";
import { sortedDashboards } from "../catalog.ts";
import { baseLocale, type Locale } from "../i18n.ts";
import { registryLink } from "../metrix.ts";
import * as m from "../paraglide/messages.js";
import type { Manifest } from "../registry.ts";
import { ActionLink } from "./action-link.tsx";
import { DashboardCard } from "./dashboard.tsx";
import { previewLabelsAttribute } from "./dashboard-previews.tsx";
import { pageContainer, Site } from "./site.tsx";

export function Home({ manifest, locale = baseLocale }: { manifest: Manifest; locale?: Locale }) {
  return (
    <Site manifest={manifest} locale={locale} tone="main">
      <section className={css({ bg: "bg.main" })} aria-labelledby="intro">
        <div
          className={cx(
            pageContainer,
            css({
              display: "grid",
              gridTemplateColumns: {
                base: "minmax(0, 1fr)",
                lg: "minmax(0, 1.2fr) minmax(0, 1fr)",
              },
              alignItems: "center",
              gap: { base: "10", lg: "16" },
              pt: { base: "8", md: "14" },
              pb: { base: "16", md: "24" },
            }),
          )}
        >
          <header className={grid({ gap: "6", minWidth: "0" })}>
            <p className={css({ textStyle: "eyebrow", color: "fg.muted" })}>
              {m.hero_eyebrow({}, { locale })}
            </p>
            <h1 id="intro" className={css({ textStyle: "display", color: "fg.headline" })}>
              {m.hero_heading({}, { locale })}
            </h1>
            <p className={css({ textStyle: "lead", maxWidth: "42rem" })}>
              {m.hero_description({}, { locale })}
            </p>
            <p className={css({ fontSize: "sm", color: "fg.muted", maxWidth: "42rem" })}>
              {m.hero_details({}, { locale })}
            </p>
            <a href="#dashboards" className={cx(textLink(), css({ justifySelf: "start" }))}>
              {m.browse_catalog({}, { locale })} <span aria-hidden="true">↓</span>
            </a>
          </header>
          <article
            className={css({
              layerStyle: "offShadow",
              p: { base: "5", md: "7" },
              display: "grid",
              gap: "4",
              minWidth: "0",
            })}
          >
            <h2 className={css({ textStyle: "heading" })}>{m.registry_heading({}, { locale })}</h2>
            <p className={css({ color: "fg.muted", fontSize: "sm" })}>
              {m.registry_description({}, { locale })}
            </p>
            <ActionLink className={button()} href={registryLink(manifest.registryURL)}>
              {m.add_registry({}, { locale })}
            </ActionLink>
            <Field name="registry-url" className={grid({ gap: "2", mt: "2", minWidth: "0" })}>
              <FieldLabel className={css({ textStyle: "eyebrow", color: "fg.muted" })}>
                {m.registry_url_label({}, { locale })}
              </FieldLabel>
              <Input
                readOnly
                value={manifest.registryURL}
                spellCheck={false}
                className={css({
                  width: "full",
                  minWidth: "0",
                  minHeight: "11",
                  px: "3",
                  py: "2.5",
                  bg: "bg.subtle",
                  fontFamily: "mono",
                  fontSize: "xs",
                })}
              />
            </Field>
            <small className={css({ color: "fg.muted", fontSize: "xs", lineHeight: "1.6" })}>
              <a className={textLink({ tone: "muted" })} href="https://metrix.bar/">
                Metrix.Bar
              </a>
              {m.platform_requirements({}, { locale })}
            </small>
          </article>
        </div>
      </section>
      <section
        className={cx(pageContainer, css({ pt: { base: "14", md: "20" } }))}
        aria-labelledby="dashboards"
        data-preview-labels={previewLabelsAttribute(locale)}
      >
        <header
          className={flex({
            justify: "space-between",
            align: "end",
            wrap: "wrap",
            gap: "4",
            mb: "8",
          })}
        >
          <div className={grid({ gap: "2" })}>
            <h2 id="dashboards" className={css({ textStyle: "heading" })}>
              {m.catalog_heading({}, { locale })}
            </h2>
            <p className={css({ color: "fg.muted", fontSize: "sm" })}>
              {m.sort_description({}, { locale })}
            </p>
          </div>
          <small className={css({ textStyle: "eyebrow", color: "fg.subtle" })}>
            {m.dashboard_count({ count: manifest.registry.dashboards.length }, { locale })}
          </small>
        </header>
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: { base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
            gap: "6",
          })}
        >
          {sortedDashboards(manifest).map((dashboard) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              manifest={manifest}
              locale={locale}
            />
          ))}
        </div>
      </section>
    </Site>
  );
}
