import type { ReactNode } from "react";
import { css, cx } from "../../styled-system/css";
import { container, flex } from "../../styled-system/patterns";
import { localePath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Manifest } from "../registry.ts";
import { ExternalArrow, GitHubIcon } from "./icons.tsx";
import { LanguagePicker } from "./language-picker.tsx";
import "./site.css";

const pageContainer = container({ width: "full", maxWidth: "1200px", px: { base: "5", md: "8" } });

export function Site({
  manifest,
  locale,
  path = "/",
  children,
}: {
  manifest: Manifest;
  locale: Locale;
  path?: string;
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
          p: "3",
          bg: "accent",
          color: "accent.fg",
          rounded: "md",
          transform: "translateY(-200%)",
          _focus: { transform: "translateY(0)" },
        })}
        href="#main"
      >
        {m.skip_content({}, { locale })}
      </a>
      <header className={cx(pageContainer, css({ py: { base: "5", md: "7" } }))}>
        <nav
          className={flex({ align: "center", justify: "space-between", gap: "4", wrap: "wrap" })}
          aria-label={m.main_navigation({}, { locale })}
        >
          <a
            className={css({
              display: "inline-flex",
              alignItems: "center",
              gap: "2.5",
              fontWeight: "800",
              fontSize: "lg",
              letterSpacing: "tight",
              textDecoration: "none",
            })}
            href={homePath}
            data-prefetch
          >
            <span
              aria-hidden="true"
              className={css({
                width: "3",
                height: "3",
                bg: "accent",
                borderWidth: "2px",
                borderColor: "border.strong",
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
              fontWeight: "semibold",
              "& a": {
                display: "inline-flex",
                alignItems: "center",
                minHeight: "8",
                whiteSpace: "nowrap",
                textDecoration: "none",
                _hover: { textDecoration: "underline" },
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
      <main id="main" className={pageContainer}>
        {children}
      </main>
      <footer
        className={cx(
          pageContainer,
          css({
            mt: "16",
            py: "8",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "3",
            color: "fg.muted",
            fontSize: "sm",
            borderTopWidth: "1px",
            borderColor: "border",
          }),
        )}
      >
        <p>{m.footer_description({}, { locale })}</p>
        <p>
          <a href="/dashboards/index.json">{m.registry_json({}, { locale })}</a> ·{" "}
          <a href="https://metrix.bar/docs/registries.md">{m.registry_guide({}, { locale })}</a>
        </p>
      </footer>
    </>
  );
}
