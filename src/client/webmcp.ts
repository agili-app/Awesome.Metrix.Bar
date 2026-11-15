import { createAgent, registerTools } from "@ui-sdk/react/agent";
import { Button } from "@ui-sdk/react/button";
import { createElement } from "react";
import { flushSync } from "react-dom";
import { hydrateRoot, type Root } from "react-dom/client";

export function enableWebMCP(): () => void {
  const agent = createAgent();
  const roots: Root[] = [];
  // Tools must see the controls as soon as they are registered with the browser.
  flushSync(() => {
    for (const container of document.querySelectorAll("[data-agent-action]")) {
      const link = container.querySelector("a")!;
      roots.push(
        hydrateRoot(
          container,
          createElement(
            Button,
            {
              className: link.className,
              "aria-label": link.getAttribute("aria-label") ?? undefined,
              render: createElement("a", {
                href: link.getAttribute("href")!,
                download: link.hasAttribute("download") || undefined,
              }),
            },
            link.textContent,
          ),
        ),
      );
    }
  });
  const unregister = registerTools(agent, { allow: (step) => !step.confirm });
  const dispose = () => {
    unregister();
    for (const root of roots) root.unmount();
  };
  import.meta.hot?.accept(() => location.reload());
  import.meta.hot?.dispose(dispose);
  return dispose;
}
