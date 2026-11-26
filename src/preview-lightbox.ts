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

function parseJSON<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function stepPreviewIndex(current: number, delta: number, count: number): number {
  if (count <= 1) return 0;
  return (((current + delta) % count) + count) % count;
}

export function parsePreviewSlides(raw: string | null | undefined): PreviewSlide[] {
  const parsed = parseJSON<unknown>(raw, []);
  return Array.isArray(parsed)
    ? parsed.filter(
        (item): item is PreviewSlide =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as PreviewSlide).src === "string",
      )
    : [];
}

export function parsePreviewLabels(raw: string | null | undefined): PreviewLightboxLabels {
  const parsed = parseJSON<Partial<PreviewLightboxLabels> | null>(raw, null);
  return parsed && typeof parsed === "object"
    ? { ...DEFAULT_PREVIEW_LABELS, ...parsed }
    : DEFAULT_PREVIEW_LABELS;
}
