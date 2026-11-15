import { ForesightManager } from "js.foresight";
import { createPrefetcher } from "../prefetch.ts";

const prefetch = createPrefetcher(location.href, (url) => {
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
});

const foresight = ForesightManager.initialize({
  setDataAttributes: false,
  touchDeviceStrategy: "onTouchStart",
});

function updateLinks() {
  for (const link of document.querySelectorAll<HTMLAnchorElement>("a[data-prefetch]")) {
    if (link.hasAttribute("download") || (link.target && link.target !== "_self")) continue;
    if (link.closest("details:not([open])")) {
      foresight.unregister(link);
    } else if (!foresight.registeredElements.has(link)) {
      foresight.register({ element: link, callback: () => prefetch(link.href) });
    }
  }
}

updateLinks();
for (const details of document.querySelectorAll("details")) {
  if (details.querySelector("a[data-prefetch]")) details.addEventListener("toggle", updateLinks);
}
