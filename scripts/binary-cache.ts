import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { writeAtomic } from "./files.ts";

const DAY_MS = 86_400_000;

export async function cachedBinaryFile({
  path,
  now,
  fetchBytes,
  label,
  required,
}: {
  path: string;
  now: number;
  fetchBytes: () => Promise<Uint8Array>;
  label: string;
  required: boolean;
}): Promise<Uint8Array | undefined> {
  const cached = existsSync(path) ? await readFile(path) : undefined;
  if (cached?.byteLength && now - (await stat(path)).mtimeMs < DAY_MS) {
    return cached;
  }
  try {
    const bytes = await fetchBytes();
    await writeAtomic(path, bytes);
    return bytes;
  } catch (error) {
    if (cached?.byteLength) {
      console.warn(`Refresh failed; using cached ${label}.`, error);
      return cached;
    }
    if (required) throw error;
    console.warn(`Skipping unavailable ${label}.`, error);
    return undefined;
  }
}
