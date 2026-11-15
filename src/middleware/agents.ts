import { defineMiddleware } from "void/handler";
import manifest from "../../.generated/manifest.json";
import { agentDocuments } from "../agents/documents.ts";
import { AGENT_HEADERS, agentResponse, prefersMarkdown } from "../agents/http.ts";
import { markdownPage } from "../agents/markdown.ts";

const documents = await agentDocuments(manifest);

export default defineMiddleware(async (context, next) => {
  const path = context.req.path;
  const document = documents[path];
  if (document) return agentResponse(document, context.req.method);
  if (prefersMarkdown(context.req.header("Accept") ?? "")) {
    const body = markdownPage(manifest, path);
    if (body !== undefined)
      return agentResponse(
        { body, contentType: "text/markdown; charset=utf-8" },
        context.req.method,
        {
          Vary: "Accept",
        },
      );
  }
  await next();
  if (
    context.res.status < 400 &&
    context.res.headers.get("Content-Type")?.startsWith("text/html")
  ) {
    for (const [name, value] of Object.entries(AGENT_HEADERS)) context.header(name, value);
    context.header("Vary", "Accept", { append: true });
  }
});
