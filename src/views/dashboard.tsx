import { css, cx } from "../../styled-system/css";
import { hstack } from "../../styled-system/patterns";
import { badge, button, card, textLink } from "../../styled-system/recipes";
import { dashboardLinks } from "../catalog.ts";
import { dashboardPath, type Locale } from "../i18n.ts";
import * as m from "../paraglide/messages.js";
import type { Dashboard, Manifest } from "../registry.ts";
import { ActionLink } from "./action-link.tsx";
import { Author } from "./author.tsx";
import { DashboardIcon } from "./dashboard-icon.tsx";
import { DashboardPreviewCover } from "./dashboard-previews.tsx";
import { ExternalArrow } from "./icons.tsx";
import { ProjectStars } from "./project-stars.tsx";

export function DashboardCard({
  dashboard,
  manifest,
  locale,
}: {
  dashboard: Dashboard;
  manifest: Manifest;
  locale: Locale;
}) {
  const repository = manifest.dashboardRepositories[dashboard.id];
  const links = dashboardLinks(dashboard, manifest);
  const detailHref = dashboardPath(dashboard.id, locale);
  const classes = card();
  return (
    <article className={cx("dashboard-card", classes.root)}>
      <div className={classes.header}>
        <div className={hstack({ gap: "3", minWidth: "0" })}>
          <DashboardIcon dashboard={dashboard} manifest={manifest} />
          <div className={css({ minWidth: "0" })}>
            <h3 className={classes.title}>
              <a href={detailHref} data-prefetch>
                {dashboard.name}
              </a>
            </h3>
            <p className={classes.meta}>
              {dashboard.author && (
                <>
                  <Author name={dashboard.author} />
                  {" · "}
                </>
              )}
              v{dashboard.version}
            </p>
          </div>
        </div>
        {repository && (
          <ProjectStars
            repository={repository}
            stars={manifest.projectStars[repository] ?? null}
            locale={locale}
          />
        )}
      </div>
      <p className={classes.body}>
        {dashboard.description ?? m.fallback_description({}, { locale })}
      </p>
      <DashboardPreviewCover dashboard={dashboard} manifest={manifest} locale={locale} />
      {dashboard.category && (
        <small className={cx(badge(), css({ alignSelf: "start" }))}>{dashboard.category}</small>
      )}
      <footer className={classes.footer}>
        <a
          className={textLink()}
          href={detailHref}
          data-prefetch
          aria-label={m.view_details({ name: dashboard.name }, { locale })}
        >
          {m.details({}, { locale })} <span aria-hidden="true">→</span>
        </a>
        {repository && (
          <a
            className={textLink({ tone: "muted" })}
            href={links.repository}
            aria-label={m.view_repository({ repository }, { locale })}
          >
            GitHub <ExternalArrow />
          </a>
        )}
        <ActionLink
          className={cx(button({ visual: "outline", size: "sm" }), css({ ml: "auto" }))}
          href={links.install}
          aria-label={m.install_named({ name: dashboard.name }, { locale })}
        >
          {m.install({}, { locale })}
        </ActionLink>
      </footer>
    </article>
  );
}
