import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import { useEffect, useRef, type TouchEvent } from "react";
import { createRoot, type Root } from "react-dom/client";
import { css } from "../../styled-system/css";
import { stepPreviewIndex, type PreviewGalleryData } from "../preview-lightbox.ts";
import * as styles from "./lightbox-styles.ts";
import { bindPreviewTriggers, readPreviewGallery } from "./preview-triggers.ts";

interface LightboxState {
  gallery: PreviewGalleryData;
  index: number;
}

function useLightboxEffects(state: LightboxState | null, onSelect: (nextIndex: number) => void) {
  const gallery = state?.gallery;
  const index = state?.index ?? 0;
  const count = gallery?.items.length ?? 0;

  useEffect(() => {
    if (!gallery || gallery.items.length <= 1) return;
    // Preload sibling slides once per gallery open for instant stepping.
    for (const item of gallery.items) {
      const image = new Image();
      image.src = item.src;
    }
  }, [gallery]);

  useEffect(() => {
    if (!gallery || count <= 1) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onSelect(stepPreviewIndex(index, -1, count));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onSelect(stepPreviewIndex(index, 1, count));
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
  }, [gallery, index, count, onSelect]);
}

function PreviewLightbox({
  state,
  finalFocus,
  onSelect,
  onClose,
}: {
  state: LightboxState | null;
  finalFocus: () => HTMLElement | null;
  onSelect: (nextIndex: number) => void;
  onClose: () => void;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useLightboxEffects(state, onSelect);

  const count = state?.gallery.items.length ?? 0;
  const current = state?.gallery.items[state.index];
  const labels = state?.gallery.labels;

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.touches[0];
    if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!state || !start || count <= 1) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) {
      onSelect(stepPreviewIndex(state.index, dx < 0 ? 1 : -1, count));
    }
  }

  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop className={styles.backdropStyle} />
      <DialogContent
        className={styles.contentStyle}
        initialFocus="content"
        finalFocus={finalFocus}
        data-testid="preview-lightbox"
      >
        {state && current && labels && (
          <>
            <header className={styles.headerStyle}>
              <div className={styles.titleGroupStyle}>
                <DialogTitle className={styles.titleStyle}>{state.gallery.title}</DialogTitle>
                {count > 1 && (
                  <span className={styles.counterStyle}>
                    {state.index + 1} / {count}
                  </span>
                )}
              </div>
              <div className={styles.actionsStyle}>
                <a
                  href={current.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionButtonStyle}
                >
                  {labels.openOriginal}
                  <span aria-hidden="true" className={css({ ml: "1" })}>
                    ↗
                  </span>
                </a>
                <DialogClose className={styles.closeButtonStyle} aria-label={labels.close}>
                  <span aria-hidden="true">✕</span>
                </DialogClose>
              </div>
            </header>

            <div className={styles.stageStyle} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              {count > 1 && (
                <button
                  type="button"
                  className={styles.prevButtonStyle}
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
                className={styles.stageImageStyle}
              />
              {count > 1 && (
                <button
                  type="button"
                  className={styles.nextButtonStyle}
                  aria-label={labels.next}
                  onClick={() => onSelect(stepPreviewIndex(state.index, 1, count))}
                >
                  <span aria-hidden="true">›</span>
                </button>
              )}
            </div>

            <footer className={styles.footerStyle}>
              <DialogDescription className={styles.captionStyle}>{current.alt}</DialogDescription>
              {count > 1 && (
                <div className={styles.thumbsStyle}>
                  {state.gallery.items.map((item, itemIndex) => (
                    <button
                      key={item.src}
                      type="button"
                      className={styles.thumbButtonStyle}
                      aria-label={item.alt}
                      aria-current={itemIndex === state.index ? "true" : undefined}
                      onClick={() => onSelect(itemIndex)}
                    >
                      <img
                        src={item.src}
                        alt=""
                        width={item.width}
                        height={item.height}
                        className={styles.thumbImageStyle}
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

let root: Root | null = null;
let host: HTMLDivElement | null = null;
let currentState: LightboxState | null = null;
let lastTrigger: HTMLAnchorElement | null = null;

function renderLightbox() {
  if (!root) {
    host = document.createElement("div");
    host.dataset.previewLightboxHost = "";
    document.body.append(host);
    root = createRoot(host);
  }
  root.render(
    <PreviewLightbox
      state={currentState}
      finalFocus={() => lastTrigger}
      onSelect={(nextIndex) => {
        if (!currentState) return;
        currentState = { ...currentState, index: nextIndex };
        renderLightbox();
      }}
      onClose={() => {
        currentState = null;
        renderLightbox();
      }}
    />,
  );
}

function disposeHost() {
  root?.unmount();
  root = null;
  host?.remove();
  host = null;
  currentState = null;
  lastTrigger = null;
}

export function openPreviewTrigger(trigger: HTMLAnchorElement): boolean {
  const next = readPreviewGallery(trigger);
  if (!next) return false;
  lastTrigger = trigger;
  currentState = next;
  renderLightbox();
  return true;
}

export function enablePreviewLightbox(): () => void {
  const unbind = bindPreviewTriggers(openPreviewTrigger);
  const dispose = () => {
    unbind();
    disposeHost();
  };
  import.meta.hot?.accept(() => location.reload());
  import.meta.hot?.dispose(dispose);
  return dispose;
}

import.meta.hot?.dispose(disposeHost);
