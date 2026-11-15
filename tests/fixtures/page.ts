import type { HeadDescriptor } from "void";

export const url = "https://registry.example/";
export const scriptPath = "/assets/prefetch-12345678.js";
export const scriptTag = `<script type="module" src="${scriptPath}"></script>`;
export const head: HeadDescriptor = {
  title: "Servers & usage",
  meta: [
    { name: "description", content: "A < B" },
    { property: "og:url", content: url },
  ],
  script: [{ type: "application/ld+json", innerHTML: '{"@type":"WebSite"}' }],
};
export const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Servers &amp; usage</title><meta name="description" content="A &lt; B">
<meta property="og:url" content="${url}"><link rel="canonical" href="${url}">
<script type="application/ld+json">{"@type":"WebSite"}</script>
${scriptTag}
</head><body></body></html>`;
