import { join, resolve } from "node:path";
import { authors } from "../src/authors.ts";
import { cachedBinaryFile } from "./binary-cache.ts";
import { writeAtomic } from "./files.ts";
import { runConcurrently } from "./http.ts";

const root = resolve(import.meta.dirname, "..");

async function fetchAvatar(url: string, fetchUpstream: typeof fetch): Promise<Uint8Array> {
  const response = await fetchUpstream(url, {
    headers: { Accept: "image/webp" },
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status !== 200) throw new Error(`Avatar download failed (${response.status})`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.byteLength) throw new Error("Empty avatar");
  return bytes;
}

export async function buildAvatars(
  cache = join(root, ".cache/avatars"),
  output = join(root, "public/avatars"),
  fetchUpstream: typeof fetch = fetch,
  now = Date.now(),
): Promise<void> {
  await runConcurrently(authors, 6, async (author) => {
    const bytes = await cachedBinaryFile({
      path: join(cache, author.file),
      now,
      fetchBytes: () => fetchAvatar(author.url, fetchUpstream),
      label: author.name,
      required: true,
    });
    await writeAtomic(join(output, author.file), bytes!);
  });
}

if (import.meta.main) {
  await buildAvatars();
  console.log(`Prepared ${authors.length} author avatars from WebP.se.`);
}
