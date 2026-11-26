import { imageSize } from "image-size";

const previewFormats = {
  png: { contentType: "image/png", extension: "png" },
  jpg: { contentType: "image/jpeg", extension: "jpg" },
  webp: { contentType: "image/webp", extension: "webp" },
  gif: { contentType: "image/gif", extension: "gif" },
  avif: { contentType: "image/avif", extension: "avif" },
} as const;

export type PreviewFormat = (typeof previewFormats)[keyof typeof previewFormats];

export type DetectedPreviewImage = PreviewFormat & {
  width: number;
  height: number;
};

export function detectPreviewImage(bytes: Uint8Array): DetectedPreviewImage {
  const result = imageSize(bytes);
  const format =
    result.type && result.type in previewFormats
      ? previewFormats[result.type as keyof typeof previewFormats]
      : undefined;
  if (!format || !result.width || !result.height) {
    throw new Error("Unsupported or invalid preview image");
  }
  const rotated = result.orientation !== undefined && result.orientation >= 5;
  return {
    ...format,
    width: rotated ? result.height : result.width,
    height: rotated ? result.width : result.height,
  };
}
