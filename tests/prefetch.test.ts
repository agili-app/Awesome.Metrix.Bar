import { describe, expect, it, vi } from "vite-plus/test";
import { locales, localePath } from "../src/i18n.ts";
import { createPrefetcher } from "../src/prefetch.ts";

const origin = "https://awesome.metrix.bar";

describe("navigation prefetch policy", () => {
  it.each(locales)("accepts rendered home and detail paths for %s", (locale) => {
    const send = vi.fn();
    const prefetch = createPrefetcher(`${origin}/dashboards/komari`, send);
    prefetch(localePath("/", locale));
    prefetch(localePath("/dashboards/pulse", locale));
    expect(send.mock.calls).toEqual([
      [new URL(localePath("/", locale), origin).href],
      [new URL(localePath("/dashboards/pulse", locale), origin).href],
    ]);
  });

  it("normalizes fragments and duplicate anchors against a three-page budget", () => {
    const send = vi.fn();
    const onExhausted = vi.fn();
    const prefetch = createPrefetcher(`${origin}/`, send, onExhausted);
    for (const href of [
      "/dashboards/pulse#setup",
      `${origin}/dashboards/pulse`,
      "/dashboards/komari",
      "/zh-CN/dashboards/pulse",
      "/dashboards/magpie",
    ])
      prefetch(href);
    expect(send.mock.calls).toEqual([
      [`${origin}/dashboards/pulse`],
      [`${origin}/dashboards/komari`],
      [`${origin}/zh-CN/dashboards/pulse`],
    ]);
    expect(onExhausted).toHaveBeenCalledTimes(1);
  });

  it("skips the current document, unsafe or non-page targets without using the budget", () => {
    const send = vi.fn();
    const prefetch = createPrefetcher(`${origin}/dashboards/pulse#setup`, send);
    for (const href of [
      "#install",
      "/dashboards/pulse#updates",
      "https://metrix.bar/",
      "//external.example/dashboards/komari",
      "metrixbar://install/pulse",
      "javascript:alert(1)",
      "http://[",
      "/dashboards/index.json",
      "/dashboards/files/pulse.bar",
      "/api/stats",
      "/avatars/author.webp",
      "/dashboards/komari?preview=true",
    ])
      prefetch(href);
    expect(send).not.toHaveBeenCalled();
    prefetch("/dashboards/komari");
    expect(send).toHaveBeenCalledExactlyOnceWith(`${origin}/dashboards/komari`);
  });
});
