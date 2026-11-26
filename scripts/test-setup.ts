import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { generateRegistryArtifacts } from "./registry-plugin.ts";

const root = resolve(import.meta.dirname, "..");

export async function setup(): Promise<void> {
  if (existsSync(join(root, ".generated/manifest.json"))) return;
  await generateRegistryArtifacts();
}
