import type { Manifest } from "vite-plus";
import { defineMiddleware } from "void/handler";
import { isPagePath } from "../prefetch.ts";
import { INDEX_PATH, PAGE_CACHE } from "../registry.ts";

let prefetchScript: string | undefined;

export default defineMiddleware(async (context, next) => {
  if (isPagePath(context.req.path)) {
    if (!import.meta.env.DEV && !prefetchScript) {
      const response: Response = await context.env.ASSETS.fetch(
        new Request(new URL("/.vite/manifest.json", context.req.url)),
      );
      if (response.ok) {
        const manifest = await response.json<Manifest>();
        const file = manifest["src/client/prefetch.ts"]?.file;
        if (file) prefetchScript = `/${file}`;
      }
    }
    const script = import.meta.env.DEV ? "/src/client/prefetch.ts" : prefetchScript;
    if (script) {
      context.set("headDefaults", { script: [{ type: "module", src: script }] });
    }
  }
  await next();
  if (context.res.status >= 400) {
    context.header("Cache-Control", "no-store");
    context.header("X-Robots-Tag", "noindex");
  } else if (context.req.path.startsWith("/avatars/")) {
    context.header("Cache-Control", "public, max-age=3600, s-maxage=86400");
  } else if (context.res.headers.get("Content-Type")?.startsWith("text/html")) {
    context.header("Cache-Control", PAGE_CACHE);
    context.header("X-Content-Type-Options", "nosniff");
  }
  if (context.req.path === INDEX_PATH || context.req.path.startsWith("/dashboards/files/")) {
    context.header("X-Robots-Tag", "noindex");
  }
});
