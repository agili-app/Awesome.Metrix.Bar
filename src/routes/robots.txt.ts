import { defineHandler } from "void/handler";
import manifest from "../../.generated/manifest.json";
import { PAGE_CACHE, siteURL } from "../registry.ts";

export const GET = defineHandler(
  () =>
    new Response(
      `User-agent: *
Allow: /
Content-Signal: search=yes, ai-input=yes
Sitemap: ${siteURL(manifest, "/sitemap.xml")}
`,
      {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": PAGE_CACHE,
          "X-Content-Type-Options": "nosniff",
        },
      },
    ),
);
