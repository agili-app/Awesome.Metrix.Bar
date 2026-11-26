import { existsSync } from "node:fs";
import { readdir, readFile, rm, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import pLimit from "p-limit";
import type { DashboardPreview } from "../src/registry.ts";
import type { Preview, Source } from "./config.ts";
import { writeAtomic } from "./files.ts";
import { detectPreviewImage } from "./image.ts";

const root = resolve(import.meta.dirname, "..");
const maxAge = 86_400_000;
const maxBytes = 5 * 1024 * 1024;

function cacheFileName(url: string): string {
  return `${Buffer.from(url).toString("base64url")}.img`;
}

async function fetchPreview(url: string, fetchUpstream: typeof fetch): Promise<Buffer> {
  const response = await fetchUpstream(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status !== 200) throw new Error(`Preview download failed (${response.status})`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.byteLength || bytes.byteLength > maxBytes) {
    throw new Error(`Invalid preview size (${bytes.byteLength} bytes)`);
  }
  return bytes;
}

async function loadPreview(
  preview: Preview,
  cacheDir: string,
  fetchUpstream: typeof fetch,
  now: number,
): Promise<Buffer | undefined> {
  const path = join(cacheDir, cacheFileName(preview.url));
  const cached = existsSync(path) ? await readFile(path) : undefined;
  if (cached?.byteLength && now - (await stat(path)).mtimeMs < maxAge) {
    return cached;
  }
  try {
    const bytes = await fetchPreview(preview.url, fetchUpstream);
    detectPreviewImage(bytes);
    await writeAtomic(path, bytes);
    return bytes;
  } catch (error) {
    if (cached?.byteLength) {
      console.warn(`Preview refresh failed; using cached ${preview.url}.`, error);
      return cached;
    }
    console.warn(`Skipping unavailable preview ${preview.url}.`, error);
    return undefined;
  }
}

export async function buildPreviews(
  sources: Pick<Source, "id" | "previews">[],
  output = join(root, "public/previews"),
  cacheDir = join(root, ".cache/previews"),
  fetchUpstream: typeof fetch = fetch,
  now = Date.now(),
): Promise<Record<string, DashboardPreview[]>> {
  const files = new Map<string, Buffer>();
  const previewsByDashboard: Record<string, DashboardPreview[]> = {};
  const tasks = sources.flatMap((source) =>
    (source.previews ?? []).map((preview, index) => ({ id: source.id, index, preview })),
  );
  const limit = pLimit(6);
  const results = await Promise.all(
    tasks.map(({ id, index, preview }) =>
      limit(async () => {
        const bytes = await loadPreview(preview, cacheDir, fetchUpstream, now);
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
          console.warn(`Skipping invalid preview ${preview.url}.`, error);
          return undefined;
        }
      }),
    ),
  );
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
