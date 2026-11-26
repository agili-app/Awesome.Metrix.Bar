import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { css, cx } from "../../styled-system/css";
import {
  parsePreviewLabels,
  parsePreviewSlides,
  stepPreviewIndex,
  type PreviewGalleryData,
} from "../preview-lightbox.ts";

interface LightboxState {
  gallery: PreviewGalleryData;
  index: number;
  trigger: HTMLAnchorElement | null;
}

const backdropStyle = css({
  position: "fixed",
  inset: "0",
  bg: "rgba(0, 0, 0, 0.78)",
  backdropFilter: "blur(4px)",
  transition: "opacity 160ms ease",
  "&[data-starting-style], &[data-ending-style]": {
    opacity: "0",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

const contentStyle = css({
  position: "fixed",
  inset: "0",
  m: "auto",
  w: "min(64rem, calc(100vw - 1.5rem))",
  h: "fit-content",
  maxH: "calc(100dvh - 1.5rem)",
  bg: "bg.surface",
  color: "fg",
  borderWidth: "2px",
  borderColor: "border.strong",
  rounded: "2xl",
  boxShadow: "raised",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  transition: "opacity 160ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
  "&[data-starting-style], &[data-ending-style]": {
    opacity: "0",
    transform: "scale(0.97)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});

const headerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  px: { base: "4", sm: "5" },
  py: "3",
  borderBottomWidth: "1px",
  borderColor: "border",
  minWidth: "0",
});

const iconButtonStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "10",
  minH: "10",
  px: "2.5",
  bg: "bg.surface",
  color: "fg",
  borderWidth: "2px",
  borderColor: "border.strong",
  rounded: "lg",
  fontSize: "sm",
  fontWeight: "bold",
  lineHeight: "1",
  boxShadow: "offset",
  cursor: "pointer",
  textDecoration: "none",
  _hover: { bg: "bg.subtle", boxShadow: "raised", textDecoration: "none" },
  _active: { boxShadow: "none" },
});

const stageStyle = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "bg.subtle",
  px: { base: "3", sm: "14" },
  py: { base: "4", sm: "5" },
  minH: "0",
  overflow: "hidden",
});

const navButtonStyle = css({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  display: { base: "none", sm: "inline-flex" },
  alignItems: "center",
  justifyContent: "center",
  w: "11",
  h: "11",
  bg: "bg.surface",
  color: "fg",
  borderWidth: "2px",
  borderColor: "border.strong",
  rounded: "lg",
  fontSize: "xl",
  fontWeight: "bold",
  lineHeight: "1",
  boxShadow: "offset",
  cursor: "pointer",
  _hover: { bg: "accent", color: "accent.fg", boxShadow: "raised" },
  _active: { boxShadow: "none" },
});

const prevButtonStyle = cx(navButtonStyle, css({ left: { base: "2", sm: "3" } }));
const nextButtonStyle = cx(navButtonStyle, css({ right: { base: "2", sm: "3" } }));

const thumbButtonStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "14",
  h: "12",
  p: "1",
  bg: "bg.subtle",
  borderWidth: "2px",
  borderColor: "border",
  rounded: "lg",
  cursor: "pointer",
  overflow: "hidden",
  _hover: { borderColor: "border.strong" },
  "&[aria-current=true]": {
    borderColor: "border.strong",
    bg: "accent",
    boxShadow: "offset",
  },
});

function PreviewLightbox({
  state,
  onSelect,
  onClose,
}: {
  state: LightboxState | null;
  onSelect: (nextIndex: number) => void;
  onClose: () => void;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const lastTrigger = useRef<HTMLAnchorElement | null>(null);
  const count = state?.gallery.items.length ?? 0;

  if (state?.trigger) lastTrigger.current = state.trigger;

  useEffect(() => {
    if (!state) return;
    // Preload sibling slides so stepping through the gallery is instant.
    for (const item of state.gallery.items) {
      if (item.src !== state.gallery.items[state.index]?.src) {
        const image = new Image();
        image.src = item.src;
      }
    }
  }, [state]);

  useEffect(() => {
    if (!state || count <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onSelect(stepPreviewIndex(state.index, -1, count));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onSelect(stepPreviewIndex(state.index, 1, count));
      } else if (event.key === "Home") {
        event.preventDefault();
        onSelect(0);
      } else if (event.key === "End") {
        event.preventDefault();
        onSelect(count - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state, count, onSelect]);

  const current = state?.gallery.items[state.index];
  const labels = state?.gallery.labels;

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop className={backdropStyle} />
      <DialogContent
        className={contentStyle}
        initialFocus="content"
        finalFocus={() => lastTrigger.current}
        data-testid="preview-lightbox"
      >
        {state && current && labels && (
          <>
            <header className={headerStyle}>
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "3",
                  minWidth: "0",
                })}
              >
                <DialogTitle
                  className={css({
                    fontSize: "lg",
                    fontWeight: "bold",
                    lineHeight: "1.2",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  })}
                >
                  {state.gallery.title}
                </DialogTitle>
                {count > 1 && (
                  <span
                    className={css({
                      flexShrink: "0",
                      px: "2",
                      py: "0.5",
                      bg: "bg.subtle",
                      borderWidth: "1px",
                      borderColor: "border",
                      rounded: "md",
                      fontFamily: "mono",
                      fontSize: "xs",
                      color: "fg.muted",
                    })}
                  >
                    {state.index + 1} / {count}
                  </span>
                )}
              </div>
              <div
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "2",
                  flexShrink: "0",
                })}
              >
                <a
                  href={current.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={iconButtonStyle}
                >
                  {labels.openOriginal}
                  <span aria-hidden="true" className={css({ ml: "1" })}>
                    ↗
                  </span>
                </a>
                <DialogClose className={iconButtonStyle} aria-label={labels.close}>
                  <span aria-hidden="true">✕</span>
                </DialogClose>
              </div>
            </header>

            <div
              className={stageStyle}
              onTouchStart={(event) => {
                const touch = event.touches[0];
                if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
              }}
              onTouchEnd={(event) => {
                const start = touchStart.current;
                touchStart.current = null;
                if (!start || count <= 1) return;
                const touch = event.changedTouches[0];
                if (!touch) return;
                const dx = touch.clientX - start.x;
                const dy = touch.clientY - start.y;
                if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
                  onSelect(stepPreviewIndex(state.index, dx < 0 ? 1 : -1, count));
                }
              }}
            >
              {count > 1 && (
                <button
                  type="button"
                  className={prevButtonStyle}
                  aria-label={labels.previous}
                  onClick={() => onSelect(stepPreviewIndex(state.index, -1, count))}
                >
                  <span aria-hidden="true">‹</span>
                </button>
              )}
              <img
                key={current.src}
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                className={css({
                  display: "block",
                  maxW: "full",
                  maxH: "calc(100dvh - 15rem)",
                  w: "auto",
                  h: "auto",
                  objectFit: "contain",
                  rounded: "lg",
                })}
              />
              {count > 1 && (
                <button
                  type="button"
                  className={nextButtonStyle}
                  aria-label={labels.next}
                  onClick={() => onSelect(stepPreviewIndex(state.index, 1, count))}
                >
                  <span aria-hidden="true">›</span>
                </button>
              )}
            </div>

            <footer
              className={css({
                display: "grid",
                gap: "3",
                px: { base: "4", sm: "5" },
                py: "3",
                borderTopWidth: "1px",
                borderColor: "border",
                justifyItems: "center",
              })}
            >
              <DialogDescription
                className={css({
                  fontSize: "sm",
                  color: "fg.muted",
                  textAlign: "center",
                })}
              >
                {current.alt}
              </DialogDescription>
              {count > 1 && (
                <div
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "2",
                    flexWrap: "wrap",
                  })}
                >
                  {state.gallery.items.map((item, itemIndex) => (
                    <button
                      key={item.src}
                      type="button"
                      className={thumbButtonStyle}
                      aria-label={item.alt}
                      aria-current={itemIndex === state.index ? "true" : undefined}
                      onClick={() => onSelect(itemIndex)}
                    >
                      <img
                        src={item.src}
                        alt=""
                        width={item.width}
                        height={item.height}
                        className={css({
                          display: "block",
                          maxW: "full",
                          maxH: "full",
                          w: "auto",
                          h: "auto",
                          objectFit: "contain",
                        })}
                      />
                    </button>
                  ))}
                </div>
              )}
            </footer>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LightboxHost({
  register,
}: {
  register: (open: (next: LightboxState) => void) => () => void;
}) {
  const [state, setState] = useState<LightboxState | null>(null);

  useEffect(() => register(setState), [register]);

  return (
    <PreviewLightbox
      state={state}
      onSelect={(nextIndex) =>
        setState((current) => (current ? { ...current, index: nextIndex } : null))
      }
      onClose={() => setState(null)}
    />
  );
}

let root: Root | null = null;
let host: HTMLDivElement | null = null;
let openLightbox: ((next: LightboxState) => void) | null = null;
let pending: LightboxState | null = null;

function registerHost(open: (next: LightboxState) => void) {
  openLightbox = open;
  if (pending) {
    open(pending);
    pending = null;
  }
  return () => {
    if (openLightbox === open) openLightbox = null;
  };
}

function ensureMounted() {
  if (root) return;
  host = document.createElement("div");
  host.dataset.previewLightboxHost = "";
  document.body.append(host);
  root = createRoot(host);
  root.render(<LightboxHost register={registerHost} />);
}

function disposeHost() {
  root?.unmount();
  root = null;
  host?.remove();
  host = null;
  openLightbox = null;
  pending = null;
}

export function openPreviewTrigger(trigger: HTMLAnchorElement): boolean {
  const container = trigger.closest<HTMLElement>("[data-preview-gallery]");
  if (!container) return false;
  const items = parsePreviewSlides(container.dataset.previews);
  if (!items.length) return false;
  const parsedIndex = Number.parseInt(trigger.dataset.previewTrigger ?? "0", 10);
  const index = Number.isNaN(parsedIndex)
    ? 0
    : Math.max(0, Math.min(items.length - 1, parsedIndex));
  const labelsElement =
    container.dataset.previewLabels !== undefined
      ? container
      : document.querySelector<HTMLElement>("[data-preview-labels]");
  const nextState: LightboxState = {
    gallery: {
      title: container.dataset.previewGallery ?? "",
      items,
      labels: parsePreviewLabels(labelsElement?.dataset.previewLabels),
    },
    index,
    trigger,
  };
  if (openLightbox) {
    openLightbox(nextState);
  } else {
    pending = nextState;
    ensureMounted();
  }
  return true;
}

export function enablePreviewLightbox(): () => void {
  function onClick(event: MouseEvent) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const trigger = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      "a[data-preview-trigger]",
    );
    if (!trigger) return;
    if (openPreviewTrigger(trigger)) event.preventDefault();
  }

  document.addEventListener("click", onClick);

  const dispose = () => {
    document.removeEventListener("click", onClick);
    disposeHost();
  };
  import.meta.hot?.accept(() => location.reload());
  import.meta.hot?.dispose(dispose);
  return dispose;
}

import.meta.hot?.dispose(disposeHost);
