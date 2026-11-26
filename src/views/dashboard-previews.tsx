import { css, cx } from "../../styled-system/css";
import { dashboardPreviews } from "../catalog.ts";
import type { Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { PreviewLightboxLabels, PreviewSlide } from "../preview-lightbox.ts";
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

const containImage = css({
  display: "block",
  maxW: "full",
  w: "auto",
  h: "auto",
  objectFit: "contain",
  rounded: "md",
});

function previewSlides(dashboard: Dashboard, manifest: Manifest, locale: Locale): PreviewSlide[] {
  return dashboardPreviews(dashboard, manifest).map((preview, index) => ({
    src: preview.path,
    width: preview.width,
    height: preview.height,
    alt: preview.alt ?? m.preview_alt({ name: dashboard.name, index: index + 1 }, { locale }),
  }));
}

export function previewLabelsAttribute(locale: Locale): string {
  const labels: PreviewLightboxLabels = {
    close: m.preview_close({}, { locale }),
    previous: m.preview_previous({}, { locale }),
    next: m.preview_next({}, { locale }),
    openOriginal: m.preview_open_original({}, { locale }),
  };
  return JSON.stringify(labels);
}

export function DashboardPreviewCover({
  dashboard,
  manifest,
  locale,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  locale: Locale;
}) {
  const slides = previewSlides(dashboard, manifest, locale);
  const first = slides[0];
  if (!first) return null;
  return (
    <a
      href={first.src}
      target="_blank"
      rel="noopener noreferrer"
      data-preview-gallery={dashboard.name}
      data-previews={JSON.stringify(slides)}
      data-preview-trigger="0"
      aria-label={m.open_preview({ label: first.alt }, { locale })}
      className={cx(
        "dashboard-preview-cover",
        css({
          position: "relative",
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
          cursor: "zoom-in",
          _hover: { borderColor: "border.strong" },
        }),
      )}
    >
      <img
        src={first.src}
        alt={first.alt}
        width={first.width}
        height={first.height}
        loading="lazy"
        decoding="async"
        className={cx(containImage, css({ maxH: "full" }))}
      />
      {slides.length > 1 && (
        <span
          aria-hidden="true"
          className={css({
            position: "absolute",
            right: "2",
            bottom: "2",
            px: "2",
            py: "0.5",
            bg: "bg.surface",
            color: "fg",
            borderWidth: "1px",
            borderColor: "border.strong",
            rounded: "md",
            fontFamily: "mono",
            fontSize: "xs",
            fontWeight: "bold",
            lineHeight: "1.3",
          })}
        >
          1 / {slides.length}
        </span>
      )}
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
  const slides = previewSlides(dashboard, manifest, locale);
  if (!slides.length) return null;
  const gridClass =
    slides.length === 1 ? galleryGrids[1] : slides.length === 2 ? galleryGrids[2] : galleryGrids[3];
  return (
    <section
      className={cx("dashboard-previews", css({ gridColumn: { lg: "1 / -1" }, minWidth: "0" }))}
      aria-labelledby="previews"
      data-preview-gallery={dashboard.name}
      data-previews={JSON.stringify(slides)}
      data-preview-labels={previewLabelsAttribute(locale)}
    >
      <h2 id="previews" className={css({ textStyle: "heading", mb: "4" })}>
        {m.previews_heading({}, { locale })}
      </h2>
      <div className={gridClass}>
        {slides.map((slide, index) => (
          <figure key={slide.src} className={css({ m: "0", minWidth: "0" })}>
            <a
              href={slide.src}
              target="_blank"
              rel="noopener noreferrer"
              data-preview-trigger={index}
              aria-label={m.open_preview({ label: slide.alt }, { locale })}
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
                cursor: "zoom-in",
                _hover: { boxShadow: "raised" },
              })}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className={cx(containImage, css({ maxH: "26rem" }))}
              />
            </a>
          </figure>
        ))}
      </div>
    </section>
  );
}
