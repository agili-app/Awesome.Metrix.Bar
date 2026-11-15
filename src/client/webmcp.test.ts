import type { AgentComponent } from "@ui-sdk/react/agent";
import { createElement, act } from "react";
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vite-plus/test";
import manifest from "../../.generated/manifest.json";
import { dashboardLinks, sortedDashboards } from "../catalog.ts";
import { registryLink } from "../metrix.ts";
import { Home } from "../views/home.tsx";
import { DashboardDetail } from "../views/detail.tsx";
import { enableWebMCP } from "./webmcp.ts";

interface Tool {
  name: string;
  execute: (input: object) => Promise<unknown>;
}

it("registers WebMCP tools that find and activate the real static page controls", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  Element.prototype.checkVisibility = () => true;
  vi.spyOn(Element.prototype, "getClientRects").mockReturnValue([] as unknown as DOMRectList);
  Element.prototype.getAnimations = () => [];
  const tools = new Map<string, Tool>();
  const firstSnapshots: Promise<AgentComponent[]>[] = [];
  Object.assign(document, {
    modelContext: {
      registerTool: async (tool: Tool, { signal }: { signal: AbortSignal }) => {
        tools.set(tool.name, tool);
        if (tool.name === "snapshot")
          firstSnapshots.push(tool.execute({}) as Promise<AgentComponent[]>);
        signal.addEventListener("abort", () => tools.delete(tool.name), { once: true });
      },
    },
  });
  const dashboard = sortedDashboards(manifest)[0]!;
  const clicks: string[] = [];
  const clicked = (event: MouseEvent) => {
    event.preventDefault();
    const anchor = (event.target as Element).closest("a");
    if (anchor) clicks.push(anchor.getAttribute("href")!);
  };
  document.addEventListener("click", clicked);
  const errors = vi.spyOn(console, "error");
  try {
    document.body.innerHTML = renderToString(createElement(Home, { manifest }));
    let dispose!: () => void;
    await act(async () => {
      dispose = enableWebMCP();
    });
    expect([...tools.keys()].sort()).toEqual(["act", "query", "snapshot"]);
    expect((await firstSnapshots[0]!).map(({ label }) => label)).toContain("Add registry");
    const snapshot = (await tools.get("snapshot")!.execute({})) as AgentComponent[];
    expect(snapshot.every((entry) => entry.label)).toBe(true);
    expect(snapshot.map(({ label }) => label)).toContain("Add registry");
    const add = snapshot.find(({ label }) => label === "Add registry")!;
    const addResult = await tools
      .get("act")!
      .execute({ steps: [{ ref: add.ref, action: "press" }] });
    expect(addResult, JSON.stringify(addResult)).toMatchObject({ ok: true });
    expect(clicks).toContain(registryLink(manifest.registryURL));
    const install = snapshot.find(({ label }) => label?.includes(dashboard.name))!;
    expect(install.actions).toContain("press");
    expect(await tools.get("query")!.execute({ text: dashboard.name })).toContainEqual(
      expect.objectContaining({ ref: install.ref, label: install.label }),
    );
    expect(
      await tools.get("act")!.execute({ steps: [{ ref: install.ref, action: "press" }] }),
    ).toMatchObject({ ok: true });
    expect(clicks).toContain(dashboardLinks(dashboard, manifest).install);
    await act(async () => {
      dispose();
    });
    expect(tools.size).toBe(0);

    document.body.innerHTML = renderToString(
      createElement(DashboardDetail, { dashboard, manifest, locale: "zh-CN" }),
    );
    await act(async () => {
      dispose = enableWebMCP();
    });
    const detail = (await tools.get("snapshot")!.execute({})) as AgentComponent[];
    expect(detail.map(({ label }) => label)).toContain("下载 .bar");
    expect((await firstSnapshots[1]!).map(({ label }) => label)).toContain("下载 .bar");
    const download = detail.find(({ label }) => label === "下载 .bar")!;
    expect(
      await tools.get("act")!.execute({ steps: [{ ref: download.ref, action: "press" }] }),
    ).toMatchObject({ ok: true });
    expect(clicks).toContain(dashboardLinks(dashboard, manifest).download);
    expect(document.querySelector("a[download]")?.hasAttribute("download")).toBe(true);
    await act(async () => {
      dispose();
    });
    expect(tools.size).toBe(0);
    expect(errors).not.toHaveBeenCalled();
  } finally {
    document.removeEventListener("click", clicked);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  }
});
