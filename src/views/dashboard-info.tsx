import { css } from "../../styled-system/css";
import { textLink } from "../../styled-system/recipes";
import type { Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Dashboard } from "../registry.ts";
import { Author } from "./author.tsx";
import { ExternalArrow } from "./icons.tsx";

export function DashboardInfo({
  dashboard,
  homepage,
  locale,
}: {
  dashboard: Dashboard;
  homepage?: string;
  locale: Locale;
}) {
  return (
    <aside
      className={css({ layerStyle: "card", p: "6", minWidth: "0" })}
      aria-labelledby="dashboard-details"
    >
      <h2 id="dashboard-details" className={css({ textStyle: "heading", mb: "5" })}>
        {m.details_heading({}, { locale })}
      </h2>
      <dl
        className={css({
          display: "grid",
          gap: "2",
          "& dt": { textStyle: "eyebrow", color: "fg.subtle" },
          "& dd": { mb: "3", fontSize: "sm" },
          "& code": { fontFamily: "mono", fontSize: "xs" },
        })}
      >
        {dashboard.author && (
          <>
            <dt>{m.author({}, { locale })}</dt>
            <dd>
              <Author name={dashboard.author} />
            </dd>
          </>
        )}
        <dt>{m.version({}, { locale })}</dt>
        <dd>{dashboard.version}</dd>
        <dt>{m.dashboard_id({}, { locale })}</dt>
        <dd>
          <code>{dashboard.id}</code>
        </dd>
        {dashboard.category && (
          <>
            <dt>{m.category({}, { locale })}</dt>
            <dd>{dashboard.category}</dd>
          </>
        )}
        {dashboard.license && (
          <>
            <dt>{m.license({}, { locale })}</dt>
            <dd>
              {dashboard.license === "UNLICENSED"
                ? m.license_undeclared({}, { locale })
                : dashboard.license}
            </dd>
          </>
        )}
      </dl>
      {(homepage || dashboard.source) && (
        <div
          className={css({
            display: "grid",
            gap: "3",
            pt: "4",
            mt: "2",
            borderTopWidth: "thin",
            borderColor: "border",
            fontSize: "sm",
          })}
        >
          {homepage && (
            <a className={textLink()} href={homepage}>
              {m.project_homepage({}, { locale })} <ExternalArrow />
            </a>
          )}
          {dashboard.source && (
            <a className={textLink()} href={dashboard.source}>
              {m.source_code({}, { locale })} <ExternalArrow />
            </a>
          )}
        </div>
      )}
    </aside>
  );
}
