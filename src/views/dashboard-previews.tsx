import { css, cx } from "../../styled-system/css";
import { dashboardPreviews } from "../catalog.ts";
import type { Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Dashboard, Manifest } from "../registry.ts";

const galleryGrids = {
  1: css({ display: "grid", gap: "4", gridTemplateColumns: "minmax(0, 1fr)", maxW: "36rem" }),
  2: css({
    display: "grid",
    gap: "4",
    gridTemplateColumns: { base: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" },
  }),
  3: css({
    display: "grid",
    gap: "4",
    gridTemplateColumns: { base: "minmax(0, 1fr)", md: "repeat(3, minmax(0, 1fr))" },
  }),
} as const;

export function DashboardPreviewCover({
  dashboard,
  manifest,
  href,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  href: string;
}) {
  const preview = dashboardPreviews(dashboard, manifest)[0];
  if (!preview) return null;
  return (
    <a
      href={href}
      tabIndex={-1}
      aria-hidden="true"
      className={cx(
        "dashboard-preview-cover",
        css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          h: "48",
          p: "3",
          bg: "bg.subtle",
          borderWidth: "1px",
          borderColor: "border",
          rounded: "lg",
          overflow: "hidden",
          textDecoration: "none",
          _hover: { borderColor: "border.strong" },
        }),
      )}
    >
      <img
        src={preview.path}
        alt=""
        width={preview.width}
        height={preview.height}
        loading="lazy"
        decoding="async"
        className={css({
          display: "block",
          maxW: "full",
          maxH: "full",
          w: "auto",
          h: "auto",
          objectFit: "contain",
          rounded: "md",
        })}
      />
    </a>
  );
}

export function DashboardPreviews({
  dashboard,
  manifest,
  locale,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  locale: Locale;
}) {
  const previews = dashboardPreviews(dashboard, manifest);
  if (!previews.length) return null;
  const gridClass =
    previews.length === 1
      ? galleryGrids[1]
      : previews.length === 2
        ? galleryGrids[2]
        : galleryGrids[3];
  return (
    <section
      className={cx(
        "dashboard-previews",
        css({
          gridColumn: { lg: "1 / -1" },
          minWidth: "0",
        }),
      )}
      aria-labelledby="previews"
    >
      <h2 id="previews" className={css({ textStyle: "heading", mb: "4" })}>
        {m.previews_heading({}, { locale })}
      </h2>
      <div className={gridClass}>
        {previews.map((preview, index) => {
          const label =
            preview.alt ?? m.preview_alt({ name: dashboard.name, index: index + 1 }, { locale });
          return (
            <figure key={preview.path} className={css({ m: "0", minWidth: "0" })}>
              <a
                href={preview.path}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={m.open_preview({ label }, { locale })}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  h: "full",
                  p: "3",
                  bg: "bg.subtle",
                  borderWidth: "2px",
                  borderColor: "border.strong",
                  rounded: "xl",
                  boxShadow: "offset",
                  textDecoration: "none",
                  _hover: { boxShadow: "raised" },
                })}
              >
                <img
                  src={preview.path}
                  alt={label}
                  width={preview.width}
                  height={preview.height}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className={css({
                    display: "block",
                    maxW: "full",
                    maxH: "26rem",
                    w: "auto",
                    h: "auto",
                    objectFit: "contain",
                    rounded: "md",
                  })}
                />
              </a>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
