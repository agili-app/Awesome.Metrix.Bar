import { ForesightManager } from "js.foresight";
import { createPrefetcher } from "../prefetch.ts";

const modelContext = (document as Document & { modelContext?: { registerTool?: unknown } })
  .modelContext;
if (typeof modelContext?.registerTool === "function") {
  void import("./webmcp.ts").then(({ enableWebMCP }) => enableWebMCP());
}
if (document.querySelector("[data-preview-gallery]")) {
  let lightboxPromise: Promise<typeof import("./preview-lightbox.tsx")> | undefined;
  const loadLightbox = () => (lightboxPromise ??= import("./preview-lightbox.tsx"));
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const trigger = (event.target as Element | null)?.closest<HTMLAnchorElement>(
      "a[data-preview-trigger]",
    );
    if (!trigger) return;
    event.preventDefault();
    void loadLightbox().then(({ openPreviewTrigger }) => openPreviewTrigger(trigger));
  });
  void loadLightbox();
}

const foresight = ForesightManager.initialize({
  setDataAttributes: false,
  touchDeviceStrategy: "onTouchStart",
});

const detailsMenus = [...document.querySelectorAll("details")].filter((details) =>
  details.querySelector("a[data-prefetch]"),
);

function stopPrefetching() {
  for (const element of foresight.registeredElements.keys()) {
    foresight.unregister(element);
  }
  for (const details of detailsMenus) {
    details.removeEventListener("toggle", onDetailsToggle);
  }
}

const prefetch = createPrefetcher(
  location.href,
  (url) => {
    if (HTMLScriptElement.supports?.("speculationrules")) {
      const rules = document.createElement("script");
      rules.type = "speculationrules";
      rules.textContent = JSON.stringify({ prefetch: [{ source: "list", urls: [url] }] });
      document.head.append(rules);
    } else {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      document.head.append(link);
    }
  },
  stopPrefetching,
);

function syncLinks(root: ParentNode) {
  for (const link of root.querySelectorAll<HTMLAnchorElement>("a[data-prefetch]")) {
    if (link.hasAttribute("download") || (link.target && link.target !== "_self")) continue;
    if (link.closest("details:not([open])")) {
      foresight.unregister(link);
    } else if (!foresight.registeredElements.has(link)) {
      foresight.register({ element: link, callback: () => prefetch(link.href) });
    }
  }
}

function onDetailsToggle(event: Event) {
  syncLinks(event.currentTarget as HTMLDetailsElement);
}

syncLinks(document);
for (const details of detailsMenus) {
  details.addEventListener("toggle", onDetailsToggle);
}
