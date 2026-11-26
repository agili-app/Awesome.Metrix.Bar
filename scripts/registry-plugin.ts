import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin, ViteDevServer } from "vite-plus";
import { buildAvatars } from "./build-avatars.ts";
import { buildRegistry } from "./build-registry.ts";

const root = resolve(import.meta.dirname, "..");
const sourcesPath = join(root, "registry/sources.json");
const authorsPath = join(root, "src/authors.ts");
const manifestPath = join(root, ".generated/manifest.json");

export async function generateRegistryArtifacts(): Promise<void> {
  const sources: unknown = JSON.parse(await readFile(sourcesPath, "utf8"));
  await Promise.all([buildRegistry(sources), buildAvatars()]);
}

function invalidateManifest(server: ViteDevServer): void {
  for (const environment of Object.values(server.environments)) {
    const mod = environment.moduleGraph.getModuleById(manifestPath);
    if (mod) environment.moduleGraph.invalidateModule(mod);
  }
  server.ws.send({ type: "full-reload" });
}

export function registryPlugin(): Plugin {
  let skip = false;
  let initialBuild: Promise<void> | undefined;
  let pendingRebuild = Promise.resolve();

  return {
    name: "awesome-metrix-registry",
    enforce: "pre",
    config(_config, env) {
      skip = Boolean(env.isPreview);
    },
    async configResolved() {
      if (skip) return;
      initialBuild ??= generateRegistryArtifacts();
      await initialBuild;
    },
    configureServer(server) {
      if (skip) return;
      server.watcher.on("change", (file) => {
        const changed = resolve(file);
        if (changed !== sourcesPath && changed !== authorsPath) return;
        pendingRebuild = pendingRebuild
          .then(async () => {
            if (changed === sourcesPath) {
              const sources: unknown = JSON.parse(await readFile(sourcesPath, "utf8"));
              await buildRegistry(sources);
            } else {
              await buildAvatars();
            }
            invalidateManifest(server);
          })
          .catch((error: unknown) => {
            server.config.logger.error(
              `[registry] Failed to rebuild after ${changed}: ${error instanceof Error ? error.message : String(error)}`,
            );
          });
      });
    },
  };
}
