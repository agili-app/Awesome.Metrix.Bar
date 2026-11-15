import Negotiator from "negotiator";
import { PAGE_CACHE } from "../registry.ts";
import type { AgentDocument } from "./documents.ts";

export const AGENT_HEADERS = {
  Link: [
    '</.well-known/api-catalog>; rel="api-catalog"',
    '</openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"',
    '</llms.txt>; rel="describedby"; type="text/plain"',
    '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
    '</.well-known/ai-catalog.json>; rel="ai-catalog"; type="application/json"',
  ].join(", "),
  "Content-Signal": "search=yes, ai-input=yes",
};

export function prefersMarkdown(accept: string): boolean {
  return (
    new Negotiator({ headers: { accept } }).mediaType([
      "text/html; charset=utf-8",
      "text/markdown; charset=utf-8",
    ]) === "text/markdown; charset=utf-8"
  );
}

export function agentResponse(
  document: AgentDocument,
  method = "GET",
  headers?: Record<string, string>,
): Response {
  const allowed = method === "GET" || method === "HEAD";
  return new Response(allowed && method === "GET" ? document.body : null, {
    status: allowed ? 200 : 405,
    headers: {
      ...AGENT_HEADERS,
      "Content-Type": document.contentType,
      "Cache-Control": allowed ? PAGE_CACHE : "no-store",
      "X-Content-Type-Options": "nosniff",
      "Access-Control-Allow-Origin": "*",
      ...(allowed ? {} : { Allow: "GET, HEAD", "X-Robots-Tag": "noindex" }),
      ...headers,
    },
  });
}
