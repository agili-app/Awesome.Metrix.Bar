import { createElement, act } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import manifest from "../../.generated/manifest.json";
import { DashboardDetail } from "../views/detail.tsx";
import { Home } from "../views/home.tsx";
import { enablePreviewLightbox } from "./preview-lightbox.tsx";

describe("preview lightbox", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("opens on preview click, supports button, thumbnail, keyboard navigation, and closes cleanly", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    Element.prototype.getAnimations = () => [];
    const beszel = manifest.registry.dashboards.find(({ id }) => id === "beszel")!;
    document.body.innerHTML = renderToString(
      createElement(DashboardDetail, { dashboard: beszel, manifest, locale: "zh-CN" }),
    );
    const dispose = enablePreviewLightbox();
    try {
      const triggers = document.querySelectorAll<HTMLAnchorElement>("a[data-preview-trigger]");
      expect(triggers).toHaveLength(3);

      // Modified click keeps native link navigation.
      const modified = new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true });
      triggers[0]!.dispatchEvent(modified);
      expect(modified.defaultPrevented).toBe(false);
      expect(document.querySelector("[data-testid=preview-lightbox]")).toBeNull();

      // Plain click opens the clicked slide inside the lightbox.
      await act(async () => {
        triggers[1]!.click();
      });
      const dialog = () => document.querySelector("[data-testid=preview-lightbox]")!;
      expect(dialog()).not.toBeNull();
      expect(dialog().textContent).toContain("Beszel");
      expect(dialog().textContent).toContain("2 / 3");
      expect(dialog().querySelector("img")!.getAttribute("src")).toBe(
        manifest.dashboardPreviews.beszel[1]!.path,
      );

      // Next button advances and wraps around.
      await act(async () => {
        dialog().querySelector<HTMLButtonElement>('button[aria-label="下一张预览"]')!.click();
      });
      expect(dialog().textContent).toContain("3 / 3");

      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      });
      expect(dialog().textContent).toContain("1 / 3");

      // Previous key wraps to the last slide.
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      });
      expect(dialog().textContent).toContain("3 / 3");

      // Thumbnail click selects directly.
      const thumbs = dialog().querySelectorAll<HTMLButtonElement>("footer button");
      expect(thumbs).toHaveLength(3);
      await act(async () => {
        thumbs[0]!.click();
      });
      expect(dialog().textContent).toContain("1 / 3");
      expect(thumbs[0]!.getAttribute("aria-current")).toBe("true");

      // Close button dismisses the dialog.
      await act(async () => {
        dialog().querySelector<HTMLButtonElement>('button[aria-label="关闭预览"]')!.click();
      });
      expect(document.querySelector("[data-testid=preview-lightbox]")).toBeNull();
    } finally {
      await act(async () => {
        dispose();
      });
    }
  });

  it("opens the full dashboard gallery directly from a home catalog preview cover", async () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    Element.prototype.getAnimations = () => [];
    document.body.innerHTML = renderToString(createElement(Home, { manifest }));
    const dispose = enablePreviewLightbox();
    try {
      const cover = document.querySelector<HTMLAnchorElement>(
        'a[data-preview-gallery="Beszel"][data-preview-trigger="0"]',
      )!;
      expect(cover).not.toBeNull();
      expect(cover.textContent).toContain("1 / 3");

      await act(async () => {
        cover.click();
      });
      const dialog = document.querySelector("[data-testid=preview-lightbox]")!;
      expect(dialog).not.toBeNull();
      expect(dialog.textContent).toContain("Beszel");
      expect(dialog.textContent).toContain("1 / 3");
      expect(dialog.querySelectorAll("footer button")).toHaveLength(3);
    } finally {
      await act(async () => {
        dispose();
      });
    }
  });
});
