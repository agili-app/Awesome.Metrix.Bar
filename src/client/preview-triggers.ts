import {
  parsePreviewLabels,
  parsePreviewSlides,
  type PreviewGalleryData,
} from "../preview-lightbox.ts";

export function findPreviewTrigger(target: EventTarget | null): HTMLAnchorElement | null {
  return target instanceof Element
    ? target.closest<HTMLAnchorElement>("a[data-preview-trigger]")
    : null;
}

export function readPreviewGallery(
  trigger: HTMLAnchorElement,
): { gallery: PreviewGalleryData; index: number } | undefined {
  const container = trigger.closest<HTMLElement>("[data-preview-gallery]");
  if (!container) return undefined;
  const items = parsePreviewSlides(container.dataset.previews);
  if (!items.length) return undefined;
  const parsedIndex = Number.parseInt(trigger.dataset.previewTrigger ?? "0", 10);
  const index = Number.isNaN(parsedIndex)
    ? 0
    : Math.max(0, Math.min(items.length - 1, parsedIndex));
  const labelsSource =
    container.dataset.previewLabels !== undefined
      ? container
      : document.querySelector<HTMLElement>("[data-preview-labels]");
  return {
    gallery: {
      title: container.dataset.previewGallery ?? "",
      items,
      labels: parsePreviewLabels(labelsSource?.dataset.previewLabels),
    },
    index,
  };
}

export function bindPreviewTriggers(
  onOpen: (trigger: HTMLAnchorElement) => void,
  onIntent?: () => void,
): () => void {
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
    const trigger = findPreviewTrigger(event.target);
    if (!trigger) return;
    event.preventDefault();
    onOpen(trigger);
  }

  let warmed = false;
  function warmOnIntent(event: Event) {
    if (warmed || !findPreviewTrigger(event.target)) return;
    warmed = true;
    onIntent?.();
    document.removeEventListener("pointerover", warmOnIntent);
    document.removeEventListener("focusin", warmOnIntent);
  }

  document.addEventListener("click", onClick);
  if (onIntent) {
    document.addEventListener("pointerover", warmOnIntent);
    document.addEventListener("focusin", warmOnIntent);
  }

  return () => {
    document.removeEventListener("click", onClick);
    document.removeEventListener("pointerover", warmOnIntent);
    document.removeEventListener("focusin", warmOnIntent);
  };
}
