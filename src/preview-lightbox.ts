export interface PreviewSlide {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface PreviewLightboxLabels {
  close: string;
  previous: string;
  next: string;
  openOriginal: string;
}

export interface PreviewGalleryData {
  title: string;
  items: PreviewSlide[];
  labels: PreviewLightboxLabels;
}

export const DEFAULT_PREVIEW_LABELS: PreviewLightboxLabels = {
  close: "Close preview",
  previous: "Previous preview",
  next: "Next preview",
  openOriginal: "Full size",
};

export function stepPreviewIndex(current: number, delta: number, count: number): number {
  if (count <= 1) return 0;
  return (((current + delta) % count) + count) % count;
}

export function parsePreviewSlides(raw: string | null | undefined): PreviewSlide[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is PreviewSlide =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as PreviewSlide).src === "string" &&
        typeof (item as PreviewSlide).width === "number" &&
        typeof (item as PreviewSlide).height === "number" &&
        typeof (item as PreviewSlide).alt === "string",
    );
  } catch {
    return [];
  }
}

export function parsePreviewLabels(raw: string | null | undefined): PreviewLightboxLabels {
  if (!raw) return DEFAULT_PREVIEW_LABELS;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_PREVIEW_LABELS;
    const candidate = parsed as Partial<PreviewLightboxLabels>;
    return {
      close: typeof candidate.close === "string" ? candidate.close : DEFAULT_PREVIEW_LABELS.close,
      previous:
        typeof candidate.previous === "string"
          ? candidate.previous
          : DEFAULT_PREVIEW_LABELS.previous,
      next: typeof candidate.next === "string" ? candidate.next : DEFAULT_PREVIEW_LABELS.next,
      openOriginal:
        typeof candidate.openOriginal === "string"
          ? candidate.openOriginal
          : DEFAULT_PREVIEW_LABELS.openOriginal,
    };
  } catch {
    return DEFAULT_PREVIEW_LABELS;
  }
}
