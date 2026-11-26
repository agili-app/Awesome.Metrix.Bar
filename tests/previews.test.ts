import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vite-plus/test";
import sources from "../registry/sources.json";
import { buildRegistry } from "../scripts/build-registry.ts";
import { inspectPreviewImage } from "../scripts/image.ts";
import { sha256 } from "../scripts/registry.ts";
import type { Source } from "../scripts/config.ts";

vi.mock("../scripts/build-stars.ts", () => ({
  buildStars: async (repositories: string[]) =>
    Object.fromEntries(repositories.map((repository) => [repository, 42])),
}));

function makePng(width: number, height: number): Buffer {
  const buf = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12, "ascii");
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

function makeGif(width: number, height: number): Buffer {
  const buf = Buffer.alloc(10);
  buf.write("GIF89a", 0, "ascii");
  buf.writeUInt16LE(width, 6);
  buf.writeUInt16LE(height, 8);
  return buf;
}

function makeJpeg(width: number, height: number): Buffer {
  const buf = Buffer.alloc(14);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xc0;
  buf.writeUInt16BE(8, 4);
  buf[6] = 8;
  buf.writeUInt16BE(height, 7);
  buf.writeUInt16BE(width, 9);
  buf[11] = 3;
  buf[12] = 0xff;
  buf[13] = 0xd9;
  return buf;
}

function makeWebpVP8X(width: number, height: number): Buffer {
  const buf = Buffer.alloc(30);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(22, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write("VP8X", 12, "ascii");
  buf.writeUInt32LE(10, 16);
  buf.writeUIntLE(width - 1, 24, 3);
  buf.writeUIntLE(height - 1, 27, 3);
  return buf;
}

function makeWebpVP8L(width: number, height: number): Buffer {
  const buf = Buffer.alloc(25);
  buf.write("RIFF", 0, "ascii");
  buf.writeUInt32LE(17, 4);
  buf.write("WEBP", 8, "ascii");
  buf.write("VP8L", 12, "ascii");
  buf.writeUInt32LE(5, 16);
  buf[20] = 0x2f;
  const bits = ((height - 1) << 14) | (width - 1);
  buf.writeUInt32LE(bits >>> 0, 21);
  return buf;
}

function makeAvif(width: number, height: number): Buffer {
  const ftyp = Buffer.alloc(20);
  ftyp.writeUInt32BE(20, 0);
  ftyp.write("ftypavif", 4, "ascii");
  ftyp.write("mif1", 16, "ascii");

  const ispe = Buffer.alloc(20);
  ispe.writeUInt32BE(20, 0);
  ispe.write("ispe", 4, "ascii");
  ispe.writeUInt32BE(width, 12);
  ispe.writeUInt32BE(height, 16);

  const ipco = Buffer.alloc(8 + ispe.length);
  ipco.writeUInt32BE(ipco.length, 0);
  ipco.write("ipco", 4, "ascii");
  ispe.copy(ipco, 8);

  const iprp = Buffer.alloc(8 + ipco.length);
  iprp.writeUInt32BE(iprp.length, 0);
  iprp.write("iprp", 4, "ascii");
  ipco.copy(iprp, 8);

  const meta = Buffer.alloc(12 + iprp.length);
  meta.writeUInt32BE(meta.length, 0);
  meta.write("meta", 4, "ascii");
  iprp.copy(meta, 12);

  return Buffer.concat([ftyp, meta]);
}

describe("preview image inspection", () => {
  it("extracts dimensions from PNG, JPEG, WebP, GIF, and AVIF headers", () => {
    expect(inspectPreviewImage(makePng(640, 960), "image/png")).toEqual({
      width: 640,
      height: 960,
    });
    expect(inspectPreviewImage(makeJpeg(1200, 800), "image/jpeg")).toEqual({
      width: 1200,
      height: 800,
    });
    expect(inspectPreviewImage(makeWebpVP8X(760, 1444), "image/webp")).toEqual({
      width: 760,
      height: 1444,
    });
    expect(inspectPreviewImage(makeWebpVP8L(920, 1080), "image/webp")).toEqual({
      width: 920,
      height: 1080,
    });
    expect(inspectPreviewImage(makeGif(400, 300), "image/gif")).toEqual({
      width: 400,
      height: 300,
    });
    expect(inspectPreviewImage(makeAvif(800, 512), "image/avif")).toEqual({
      width: 800,
      height: 512,
    });
  });

  it("rejects mismatched content types, HTML error pages, and zero-dimension headers", () => {
    expect(() => inspectPreviewImage(makePng(100, 100), "image/webp")).toThrow("mismatched");
    expect(() => inspectPreviewImage(Buffer.from("<html>404</html>"), "image/png")).toThrow(
      "mismatched",
    );
    expect(() => inspectPreviewImage(makePng(0, 100), "image/png")).toThrow("mismatched");
  });
});

describe("preview publishing", () => {
  it("copies hash-pinned previews, records dimensions, and removes stale preview files", async () => {
    const output = await mkdtemp(join(tmpdir(), "metrix-previews-"));
    const previewsDir = join(output, "previews");
    const raw = Buffer.from(
      '<bar protocol-version="0" id="preview-demo" title="Preview Demo" version="1.0.0"><script>export default {};</script></bar>',
    );
    const barHash = sha256(raw);
    const png = makePng(720, 1024);
    const pngHash = sha256(png);
    await writeFile(`.cache/downloads/${barHash}.bar`, raw);
    await writeFile(`.cache/downloads/${pngHash}.png`, png);
    const item: Source = {
      id: "preview-demo",
      repository: "author/preview-demo",
      path: "preview-demo.bar",
      author: "author",
      license: "MIT",
      previews: [
        {
          url: "https://example.com/preview.png",
          sha256: pngHash,
          contentType: "image/png",
          alt: "Main overview panel",
        },
      ],
      releases: [{ commit: "a".repeat(40), version: "1.0.0", sha256: barHash }],
    };
    try {
      const manifest = await buildRegistry({ ...sources, dashboards: [item] }, output, previewsDir);
      expect(manifest.registry.dashboards[0]).not.toHaveProperty("previews");
      expect(manifest.dashboardPreviews["preview-demo"]).toEqual([
        {
          path: `/previews/${pngHash}.png`,
          width: 720,
          height: 1024,
          contentType: "image/png",
          alt: "Main overview panel",
        },
      ]);
      expect(await readFile(join(previewsDir, `${pngHash}.png`))).toEqual(png);
      await writeFile(join(previewsDir, "stale.png"), "old");
      await buildRegistry(
        { ...sources, dashboards: [{ ...item, previews: undefined }] },
        output,
        previewsDir,
      );
      expect(await readdir(previewsDir)).toEqual([]);
    } finally {
      await rm(output, { recursive: true, force: true });
    }
  });
});
