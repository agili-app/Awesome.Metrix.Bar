import type { Manifest } from "vite-plus";
import { defineMiddleware } from "void/handler";
import { isPagePath } from "../prefetch.ts";
import { INDEX_PATH, PAGE_CACHE } from "../registry.ts";

type PageContext = Parameters<Parameters<typeof defineMiddleware>[0]>[0];

let prefetchScriptPromise: Promise<string | undefined> | undefined;

async function resolvePrefetchScript(context: PageContext): Promise<string | undefined> {
  if (import.meta.env.DEV) return "/src/client/prefetch.ts";
  if (!prefetchScriptPromise) {
    prefetchScriptPromise = context.env.ASSETS.fetch(
      new Request(new URL("/.vite/manifest.json", context.req.url)),
    )
      .then(async (response) => {
        if (!response.ok) return undefined;
        const manifest = await response.json<Manifest>();
        const file = manifest["src/client/prefetch.ts"]?.file;
        return file ? `/${file}` : undefined;
      })
      .catch(() => undefined)
      .then((script) => {
        if (!script) prefetchScriptPromise = undefined;
        return script;
      });
  }
  return prefetchScriptPromise;
}

function applyResponseHeaders(context: PageContext) {
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
}

export default defineMiddleware(async (context, next) => {
  if (isPagePath(context.req.path)) {
    const script = await resolvePrefetchScript(context);
    if (script) {
      context.set("headDefaults", { script: [{ type: "module", src: script }] });
    }
  }
  await next();
  applyResponseHeaders(context);
});
