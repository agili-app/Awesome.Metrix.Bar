import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite-plus";

const root = resolve(import.meta.dirname, "..");
const indexPath = join(root, "design/index.html");
const DESIGN_PATH = "/__design";

export function designPlugin(): Plugin {
  return {
    name: "awesome-metrix-design",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url ? new URL(req.url, "http://localhost").pathname : "";
        if (pathname !== DESIGN_PATH && pathname !== `${DESIGN_PATH}/`) {
          next();
          return;
        }
        try {
          const raw = await readFile(indexPath, "utf8");
          const html = await server.transformIndexHtml(DESIGN_PATH, raw);
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(html);
        } catch (error) {
          next(error);
        }
      });

      const printUrls = server.printUrls.bind(server);
      server.printUrls = () => {
        printUrls();
        const local = server.resolvedUrls?.local[0];
        if (local) {
          const url = new URL(DESIGN_PATH, local).href;
          server.config.logger.info(`  ➜  Design:  ${url}`);
        }
      };
    },
  };
}
