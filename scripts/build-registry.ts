import { readdir, readFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { INDEX_PATH } from "../src/registry.ts";
import type { Asset, Dashboard, DashboardPreview, Manifest, Registry } from "../src/registry.ts";
import { completeEntry, sha256, sourceURL, validateRegistry } from "./registry.ts";
import { validateSources } from "./config.ts";
import { download } from "./download.ts";
import { inspectPreviewImage, PREVIEW_EXTENSIONS } from "./image.ts";
import { parseBar } from "./parse-bar.ts";
import { writeAtomic } from "./files.ts";
import { buildStars } from "./build-stars.ts";

const root = resolve(import.meta.dirname, "..");

export async function buildRegistry(
  input: unknown,
  generated = join(root, ".generated"),
  previewsDir = generated === join(root, ".generated")
    ? join(root, "public/previews")
    : join(generated, "previews"),
): Promise<Manifest> {
  const config = validateSources(input);
  const [builder, schema] = await Promise.all([
    download(config.tools.builder, "mjs"),
    download(config.tools.schema, "json"),
  ]);
  const parsedSchema = JSON.parse(schema.bytes.toString()) as object;
  const resources: Record<string, Asset> = {};
  const previewFiles = new Map<string, Buffer>();
  const dashboardPreviews: Record<string, DashboardPreview[]> = {};
  const dashboards = await Promise.all(
    config.dashboards.map(async (source) => {
      let latest: Dashboard | undefined;
      // Parse historical releases too: their immutable URLs must survive future deployments.
      for (const release of source.releases) {
        const { bytes } = await download(
          { url: sourceURL(source, release), sha256: release.sha256 },
          "bar",
        );
        const entry = completeEntry(
          await parseBar(builder.path, bytes, release.path ?? source.path, source.id),
          source,
          release,
        );
        resources[`/dashboards/${entry.file}`] = {
          url: sourceURL(source, release),
          sha256: entry.sha256,
          contentType: "application/octet-stream",
        };
        if (entry.icon && /^(?:https?:|\/\/)/i.test(entry.icon)) {
          const icon = release.icon;
          if (!icon || icon.url !== entry.icon) {
            throw new Error(
              `Remote icon needs a pinned release.icon (url, sha256, contentType): ${source.id}`,
            );
          }
          await download(icon, "icon");
          const path = `/dashboards/icons/${icon.sha256}`;
          resources[path] = icon;
          entry.icon = new URL(path, config.registry.origin).href;
        }
        latest = entry;
      }
      if (source.previews?.length) {
        dashboardPreviews[source.id] = await Promise.all(
          source.previews.map(async (preview) => {
            const extension = PREVIEW_EXTENSIONS[preview.contentType];
            const { bytes } = await download(preview, extension);
            const { width, height } = inspectPreviewImage(bytes, preview.contentType);
            const filename = `${preview.sha256}.${extension}`;
            previewFiles.set(filename, bytes);
            return {
              path: `/previews/${filename}`,
              width,
              height,
              contentType: preview.contentType,
              ...(preview.alt ? { alt: preview.alt } : {}),
            };
          }),
        );
      }
      return latest!;
    }),
  );
  const registry: Registry = {
    $schema: config.tools.schema.url,
    schema_version: 1,
    id: config.registry.id,
    name: config.registry.name,
    dashboards,
  };
  validateRegistry(registry, parsedSchema);
  await Promise.all(
    [...previewFiles.entries()].map(([filename, bytes]) =>
      writeAtomic(join(previewsDir, filename), bytes),
    ),
  );
  const existingPreviews = await readdir(previewsDir).catch(() => []);
  await Promise.all(
    existingPreviews
      .filter((filename) => !previewFiles.has(filename))
      .map((filename) => rm(join(previewsDir, filename), { force: true })),
  );
  const index = `${JSON.stringify(registry, null, 2)}\n`;
  const manifest: Manifest = {
    registryURL: new URL(INDEX_PATH, config.registry.origin).href,
    registry,
    indexETag: `"${sha256(index)}"`,
    assets: Object.fromEntries(Object.entries(resources).sort(([a], [b]) => a.localeCompare(b))),
    dashboardRepositories: Object.fromEntries(
      config.dashboards.map(({ id, repository }) => [id, repository]),
    ),
    dashboardPreviews: Object.fromEntries(
      config.dashboards
        .filter(({ id }) => dashboardPreviews[id]?.length)
        .map(({ id }) => [id, dashboardPreviews[id]!]),
    ),
    projectStars: await buildStars(config.dashboards.map(({ repository }) => repository)),
  };
  await writeAtomic(join(generated, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

if (import.meta.main) {
  const config: unknown = JSON.parse(await readFile(join(root, "registry/sources.json"), "utf8"));
  const manifest = await buildRegistry(config);
  const previewCount = Object.values(manifest.dashboardPreviews).reduce(
    (sum, items) => sum + items.length,
    0,
  );
  console.log(
    `Built ${manifest.registry.dashboards.length} dashboards, ${Object.keys(manifest.assets).length} immutable resource routes, and ${previewCount} preview images.`,
  );
}
