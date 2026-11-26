import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { buildPreviews } from "../scripts/build-previews.ts";
import { detectPreviewImage } from "../scripts/image.ts";

const directories: string[] = [];
async function temporary() {
  const root = await mkdtemp(join(tmpdir(), "metrix-previews-"));
  directories.push(root);
  return { cache: join(root, "cache"), output: join(root, "output") };
}
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
  vi.restoreAllMocks();
});

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
  // Minimal valid JPEG: SOI + empty APP0 + 1-component SOF0 + EOI.
  const buf = Buffer.alloc(21);
  buf[0] = 0xff;
  buf[1] = 0xd8;
  buf[2] = 0xff;
  buf[3] = 0xe0;
  buf.writeUInt16BE(2, 4);
  buf[6] = 0xff;
  buf[7] = 0xc0;
  buf.writeUInt16BE(11, 8);
  buf[10] = 8;
  buf.writeUInt16BE(height, 11);
  buf.writeUInt16BE(width, 13);
  buf[15] = 1;
  buf[16] = 1;
  buf[17] = 0x11;
  buf[18] = 0;
  buf[19] = 0xff;
  buf[20] = 0xd9;
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

describe("preview image detection", () => {
  it("detects format and dimensions from PNG, JPEG, WebP, GIF, and AVIF headers", () => {
    expect(detectPreviewImage(makePng(640, 960))).toEqual({
      contentType: "image/png",
      extension: "png",
      width: 640,
      height: 960,
    });
    expect(detectPreviewImage(makeJpeg(1200, 800))).toEqual({
      contentType: "image/jpeg",
      extension: "jpg",
      width: 1200,
      height: 800,
    });
    expect(detectPreviewImage(makeWebpVP8X(760, 1444))).toEqual({
      contentType: "image/webp",
      extension: "webp",
      width: 760,
      height: 1444,
    });
    expect(detectPreviewImage(makeWebpVP8L(920, 1080))).toEqual({
      contentType: "image/webp",
      extension: "webp",
      width: 920,
      height: 1080,
    });
    expect(detectPreviewImage(makeGif(400, 300))).toEqual({
      contentType: "image/gif",
      extension: "gif",
      width: 400,
      height: 300,
    });
    expect(detectPreviewImage(makeAvif(800, 512))).toEqual({
      contentType: "image/avif",
      extension: "avif",
      width: 800,
      height: 512,
    });
  });

  it("rejects HTML error pages, SVGs, and zero-dimension headers", () => {
    expect(() => detectPreviewImage(Buffer.from("<html>404</html>"))).toThrow();
    expect(() => detectPreviewImage(Buffer.from("<svg/>"))).toThrow();
    expect(() => detectPreviewImage(makePng(0, 100))).toThrow();
  });
});

describe("optional preview publishing", () => {
  it("caches previews, keeps expired caches on refresh error, skips missing previews, and removes stale files", async () => {
    const { cache, output } = await temporary();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const png = makePng(720, 1024);
    const upstream = vi.fn<typeof fetch>(async (input) => {
      const href =
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (href.includes("missing")) return new Response("not found", { status: 404 });
      return new Response(new Uint8Array(png));
    });
    const list = [
      {
        id: "demo",
        previews: [
          { url: "https://example.com/a.png", alt: "Overview" },
          { url: "https://example.com/missing.png", alt: "Missing" },
        ],
      },
      { id: "plain" },
    ];

    const first = await buildPreviews(list, output, cache, upstream);
    expect(first).toEqual({
      demo: [
        {
          path: "/previews/demo-1.png",
          width: 720,
          height: 1024,
          contentType: "image/png",
          alt: "Overview",
        },
      ],
    });
    expect(await readFile(join(output, "demo-1.png"))).toEqual(png);
    expect(warn).toHaveBeenCalledTimes(1);

    // Within TTL, valid cached previews are reused without hitting upstream again.
    await buildPreviews(
      [{ id: "demo", previews: [list[0]!.previews![0]!] }],
      output,
      cache,
      upstream,
    );
    expect(upstream).toHaveBeenCalledTimes(2);

    // After TTL expires, refresh failures fall back to cached bytes instead of failing the build.
    upstream.mockRejectedValue(new Error("offline"));
    const fallback = await buildPreviews(
      [{ id: "demo", previews: [list[0]!.previews![0]!] }],
      output,
      cache,
      upstream,
      Date.now() + 86_401_000,
    );
    expect(fallback.demo).toHaveLength(1);

    // Removing previews cleans stale output files.
    await writeFile(join(output, "stale.png"), "old");
    const empty = await buildPreviews([{ id: "demo" }], output, cache, upstream);
    expect(empty).toEqual({});
    expect(await readdir(output)).toEqual([]);
  });
});
