import type { ReactNode } from "react";
import { css, cx } from "../../styled-system/css";
import { container, flex } from "../../styled-system/patterns";
import { textLink } from "../../styled-system/recipes";
import { localePath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Manifest } from "../registry.ts";
import { ExternalArrow, GitHubIcon } from "./icons.tsx";
import { LanguagePicker } from "./language-picker.tsx";
import "./site.css";

export const pageContainer = container({
  width: "full",
  maxWidth: "1200px",
  px: { base: "5", md: "8" },
});

export function Site({
  manifest,
  locale,
  path = "/",
  tone,
  children,
}: {
  manifest: Manifest;
  locale: Locale;
  path?: string;
  /** `main` paints the header with the hero band so a full-bleed hero can continue it. */
  tone?: "main";
  children: ReactNode;
}) {
  const homePath = localePath("/", locale);
  const githubLabel = m.site_github_label({}, { locale });
  return (
    <>
      <a
        className={css({
          position: "absolute",
          top: "4",
          left: "4",
          zIndex: "10",
          px: "4",
          py: "2",
          bg: "accent",
          color: "fg.onAccent",
          fontWeight: "semibold",
          borderWidth: "thick",
          borderColor: "border.ink",
          rounded: "control",
          transform: "translateY(-200%)",
          _focus: { transform: "translateY(0)" },
        })}
        href="#main"
      >
        {m.skip_content({}, { locale })}
      </a>
      <header className={tone === "main" ? css({ bg: "bg.main" }) : undefined}>
        <nav
          className={cx(
            pageContainer,
            flex({ align: "center", justify: "space-between", gap: "4", wrap: "wrap" }),
            css({ py: { base: "5", md: "6" } }),
          )}
          aria-label={m.main_navigation({}, { locale })}
        >
          <a
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "2.5",
              fontWeight: "bold",
              fontSize: "lg",
              letterSpacing: "tight",
            })}
            href={homePath}
            data-prefetch
          >
            <span
              aria-hidden="true"
              className={css({
                width: "3.5",
                height: "3.5",
                bg: "accent",
                borderWidth: "thick",
                borderColor: "border.ink",
                rounded: "sm",
                flexShrink: "0",
              })}
            />
            {manifest.registry.name}
          </a>
          <ul
            className={css({
              display: "flex",
              flexWrap: "wrap",
              width: { base: "full", sm: "auto" },
              alignItems: "center",
              gap: { base: "4", md: "6" },
              listStyle: "none",
              fontSize: "sm",
              fontWeight: "medium",
              "& > li > a, & summary": {
                display: "inline-flex",
                alignItems: "center",
                gap: "1",
                minHeight: "8",
                whiteSpace: "nowrap",
                color: "fg.muted",
                transitionProperty: "color",
                transitionDuration: "fast",
                _hover: { color: "fg" },
              },
            })}
          >
            <li>
              <a href={`${homePath}#dashboards`} data-prefetch>
                {m.dashboards({}, { locale })}
              </a>
            </li>
            <li>
              <a href="https://metrix.bar/">
                Metrix.Bar <ExternalArrow />
              </a>
            </li>
            <li>
              <a
                href="https://github.com/agili-app/Awesome.Metrix.Bar"
                aria-label={githubLabel}
                title={githubLabel}
              >
                <GitHubIcon />
              </a>
            </li>
            <li className={css({ marginLeft: "auto" })}>
              <LanguagePicker locale={locale} path={path} />
            </li>
          </ul>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer
        className={cx(
          pageContainer,
          css({
            mt: "20",
            py: "8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "3",
            color: "fg.muted",
            fontSize: "sm",
            borderTopWidth: "thin",
            borderColor: "border",
          }),
        )}
      >
        <p>{m.footer_description({}, { locale })}</p>
        <p>
          <a className={textLink({ tone: "muted" })} href="/dashboards/index.json">
            {m.registry_json({}, { locale })}
          </a>{" "}
          ·{" "}
          <a className={textLink({ tone: "muted" })} href="https://metrix.bar/docs/registries.md">
            {m.registry_guide({}, { locale })}
          </a>
        </p>
      </footer>
    </>
  );
}
