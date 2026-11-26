import { readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { DashboardPreview, Manifest } from "../src/registry.ts";
import { cachedBinaryFile } from "./binary-cache.ts";
import type { Source } from "./config.ts";
import { writeAtomic } from "./files.ts";
import { runConcurrently } from "./http.ts";
import { detectPreviewImage } from "./image.ts";

const root = resolve(import.meta.dirname, "..");
const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;

async function fetchPreview(url: string, fetchUpstream: typeof fetch): Promise<Uint8Array> {
  const response = await fetchUpstream(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status !== 200) throw new Error(`Preview download failed (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength || bytes.byteLength > MAX_PREVIEW_BYTES) {
    throw new Error(`Invalid preview size (${bytes.byteLength} bytes)`);
  }
  detectPreviewImage(bytes);
  return bytes;
}

export async function buildPreviews(
  sources: Pick<Source, "id" | "previews">[],
  output = join(root, "public/previews"),
  cacheDir = join(root, ".cache/previews"),
  fetchUpstream: typeof fetch = fetch,
  now = Date.now(),
): Promise<Manifest["dashboardPreviews"]> {
  const tasks = sources.flatMap((source) =>
    (source.previews ?? []).map((preview, index) => ({ id: source.id, index, preview })),
  );
  const results = await runConcurrently(tasks, 6, async ({ id, index, preview }) => {
    const bytes = await cachedBinaryFile({
      path: join(cacheDir, `${Buffer.from(preview.url).toString("base64url")}.img`),
      now,
      fetchBytes: () => fetchPreview(preview.url, fetchUpstream),
      label: preview.url,
      required: false,
    });
    if (!bytes) return undefined;
    try {
      const image = detectPreviewImage(bytes);
      const filename = `${id}-${index + 1}.${image.extension}`;
      return {
        id,
        filename,
        bytes,
        entry: {
          path: `/previews/${filename}`,
          width: image.width,
          height: image.height,
          contentType: image.contentType,
          ...(preview.alt ? { alt: preview.alt } : {}),
        } satisfies DashboardPreview,
      };
    } catch (error) {
      console.warn(`Skipping invalid cached preview ${preview.url}.`, error);
      return undefined;
    }
  });
  const files = new Map<string, Uint8Array>();
  const previewsByDashboard: Manifest["dashboardPreviews"] = {};
  for (const result of results) {
    if (!result) continue;
    files.set(result.filename, result.bytes);
    (previewsByDashboard[result.id] ??= []).push(result.entry);
  }
  await Promise.all(
    [...files.entries()].map(([filename, bytes]) => writeAtomic(join(output, filename), bytes)),
  );
  const existing = await readdir(output).catch(() => []);
  await Promise.all(
    existing
      .filter((filename) => !files.has(filename))
      .map((filename) => rm(join(output, filename), { force: true })),
  );
  return previewsByDashboard;
}
