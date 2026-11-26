import { createHash } from "node:crypto";
import { basename } from "node:path";
import type { ValidateFunction } from "ajv";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { isBarPath } from "./config.ts";
import type { Release, Source } from "./config.ts";
import type { Dashboard, Registry } from "../src/registry.ts";

const validators = new Map<string, { ajv: Ajv2020; validate: ValidateFunction<Registry> }>();

function registryValidator(schema: object) {
  const key = JSON.stringify(schema);
  let entry = validators.get(key);
  if (!entry) {
    const ajv = new Ajv2020({ allErrors: true });
    addFormats(ajv);
    entry = { ajv, validate: ajv.compile<Registry>(schema) };
    validators.set(key, entry);
  }
  return entry;
}

export function sha256(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function sourcePath(source: Source, release: Pick<Release, "path">): string {
  return (release.path ?? source.path).split("/").map(encodeURIComponent).join("/");
}

export function sourceURL(source: Source, release: Pick<Release, "commit" | "path">): string {
  return `https://raw.githubusercontent.com/${source.repository}/${release.commit}/${sourcePath(source, release)}`;
}

export function completeEntry(entry: Dashboard, source: Source, release: Release): Dashboard {
  if (entry.protocol_version !== "0") throw new Error("Unsupported dashboard protocol");
  if (
    entry.id !== source.id ||
    entry.version !== release.version ||
    entry.sha256 !== release.sha256
  ) {
    throw new Error(`File metadata does not match pinned release: ${source.id} ${release.version}`);
  }
  const filename = encodeURIComponent(basename(release.path ?? source.path));
  return {
    ...entry,
    file: `files/${entry.sha256}/${filename}`,
    license: entry.license ?? source.license,
    homepage: entry.homepage ?? `https://github.com/${source.repository}`,
    author: source.author,
    source: `https://github.com/${source.repository}/blob/${release.commit}/${sourcePath(source, release)}`,
  };
}

export function validateRegistry(registry: unknown, schema: object): asserts registry is Registry {
  const { ajv, validate } = registryValidator(schema);
  if (!validate(registry)) throw new Error(`Invalid registry: ${ajv.errorsText(validate.errors)}`);
  const ids = new Set<string>();
  for (const entry of registry.dashboards) {
    if (ids.has(entry.id)) throw new Error(`Duplicate dashboard id: ${entry.id}`);
    ids.add(entry.id);
    const file = decodeURIComponent(entry.file);
    if (!file.startsWith("files/") || !isBarPath(file)) {
      throw new Error(`Invalid registry file path: ${entry.file}`);
    }
  }
}
