export const PREVIEW_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type PreviewContentType = (typeof PREVIEW_IMAGE_TYPES)[number];

export const PREVIEW_EXTENSIONS: Record<PreviewContentType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface DetectedPreviewImage extends ImageDimensions {
  contentType: PreviewContentType;
  extension: string;
}

function pngDimensions(bytes: Buffer): ImageDimensions | undefined {
  if (bytes.length < 24) return;
  if (
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47 ||
    bytes[4] !== 0x0d ||
    bytes[5] !== 0x0a ||
    bytes[6] !== 0x1a ||
    bytes[7] !== 0x0a ||
    bytes.toString("ascii", 12, 16) !== "IHDR"
  ) {
    return;
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function gifDimensions(bytes: Buffer): ImageDimensions | undefined {
  if (bytes.length < 10) return;
  const header = bytes.toString("ascii", 0, 6);
  if (header !== "GIF87a" && header !== "GIF89a") return;
  return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
}

function webpDimensions(bytes: Buffer): ImageDimensions | undefined {
  if (
    bytes.length < 25 ||
    bytes.toString("ascii", 0, 4) !== "RIFF" ||
    bytes.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return;
  }
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X" && bytes.length >= 30) {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (
    chunk === "VP8 " &&
    bytes.length >= 30 &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && bytes[20] === 0x2f) {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
}

function jpegDimensions(bytes: Buffer): ImageDimensions | undefined {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return;
  let offset = 2;
  while (offset + 4 <= bytes.length) {
    while (offset < bytes.length && bytes[offset] === 0xff) offset++;
    if (offset >= bytes.length) break;
    const marker = bytes[offset++]!;
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (offset + 2 > bytes.length) break;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) break;
    const isStartOfFrame =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame && length >= 7) {
      return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    }
    offset += length;
  }
}

function findAvifIspe(bytes: Buffer, start: number, end: number): ImageDimensions | undefined {
  let offset = start;
  while (offset + 8 <= end) {
    let size = bytes.readUInt32BE(offset);
    let headerSize = 8;
    if (size === 1) {
      if (offset + 16 > end) break;
      size = Number(bytes.readBigUInt64BE(offset + 8));
      headerSize = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) break;
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const bodyStart = offset + headerSize;
    const boxEnd = offset + size;
    if (type === "ispe" && bodyStart + 12 <= boxEnd) {
      return {
        width: bytes.readUInt32BE(bodyStart + 4),
        height: bytes.readUInt32BE(bodyStart + 8),
      };
    }
    if (type === "meta" && bodyStart + 4 < boxEnd) {
      const found = findAvifIspe(bytes, bodyStart + 4, boxEnd);
      if (found) return found;
    } else if (type === "iprp" || type === "ipco") {
      const found = findAvifIspe(bytes, bodyStart, boxEnd);
      if (found) return found;
    }
    offset = boxEnd;
  }
}

function avifDimensions(bytes: Buffer): ImageDimensions | undefined {
  if (bytes.length < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") return;
  const ftypEnd = bytes.readUInt32BE(0);
  if (ftypEnd < 16 || ftypEnd > bytes.length) return;
  const brands = bytes.toString("ascii", 8, ftypEnd);
  if (!brands.includes("avif") && !brands.includes("avis")) return;
  return findAvifIspe(bytes, ftypEnd, bytes.length);
}

const detectors: [PreviewContentType, (bytes: Buffer) => ImageDimensions | undefined][] = [
  ["image/png", pngDimensions],
  ["image/webp", webpDimensions],
  ["image/jpeg", jpegDimensions],
  ["image/gif", gifDimensions],
  ["image/avif", avifDimensions],
];

export function detectPreviewImage(bytes: Buffer): DetectedPreviewImage {
  for (const [contentType, parse] of detectors) {
    const dimensions = parse(bytes);
    if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
      return { contentType, extension: PREVIEW_EXTENSIONS[contentType], ...dimensions };
    }
  }
  throw new Error("Unsupported or invalid preview image");
}
