import type { ComponentType } from "react";
import { badge, button, card, textLink } from "../styled-system/recipes";
import { token } from "../styled-system/tokens";
import type { Token } from "../styled-system/types/tokens";

const examples = Object.entries(
  import.meta.glob<{ Example: ComponentType }>("./examples/*.tsx", { eager: true }),
).map(([path, module]) => ({
  name: path.replace("./examples/", "").replace(".tsx", ""),
  Example: module.Example,
}));

const colors: Token[] = [
  "colors.bg",
  "colors.bg.subtle",
  "colors.bg.muted",
  "colors.bg.muted.hover",
  "colors.bg.surface",
  "colors.bg.inverted",
  "colors.bg.main",
  "colors.bg.emphasized",
  "colors.bg.emphasized.hover",
  "colors.bg.overlay",
  "colors.fg",
  "colors.fg.muted",
  "colors.fg.subtle",
  "colors.fg.inverted",
  "colors.fg.headline",
  "colors.fg.onAccent",
  "colors.accent",
  "colors.accent.emphasis",
  "colors.accent.subtle",
  "colors.accent.wash",
  "colors.link",
  "colors.link.emphasized",
  "colors.border",
  "colors.border.muted",
  "colors.border.ink",
  "colors.danger",
  "colors.focusRing",
];

export function Gallery() {
  const classes = card();
  return (
    <main className="gallery">
      <header className="gallery-intro">
        <p className="gallery-eyebrow">Internal · not deployed</p>
        <h1>Awesome.Metrix.Bar design system</h1>
        <p>
          Panda tokens, project recipes, and every ui-sdk component themed through{" "}
          <code>theme/ui-sdk.ts</code>. Switch the system color scheme to check dark mode.
        </p>
      </header>

      <section aria-labelledby="colors">
        <h2 id="colors">Colors</h2>
        <ul className="gallery-swatches">
          {colors.map((name) => (
            <li key={name}>
              <span className="gallery-swatch" style={{ background: token.var(name) }} />
              <code>{name.replace("colors.", "")}</code>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="recipes">
        <h2 id="recipes">Project recipes</h2>
        <div className="gallery-row">
          <a className={button()} href="#recipes">
            Main
          </a>
          <a className={button({ visual: "secondary" })} href="#recipes">
            Secondary
          </a>
          <a className={button({ visual: "outline" })} href="#recipes">
            Outline
          </a>
          <a className={button({ visual: "outline", size: "sm" })} href="#recipes">
            Outline sm
          </a>
          <a
            className={button({ visual: "outline", size: "icon" })}
            href="#recipes"
            aria-label="Close"
          >
            ✕
          </a>
        </div>
        <div className="gallery-row">
          <a className={textLink()} href="#recipes">
            Text link
          </a>
          <a className={textLink({ tone: "muted" })} href="#recipes">
            Muted link
          </a>
          <span className={badge()}>outline badge</span>
          <span className={badge({ visual: "solid" })}>solid badge</span>
        </div>
        <article className={classes.root} style={{ maxWidth: "28rem" }}>
          <div className={classes.header}>
            <div>
              <h3 className={classes.title}>
                <a href="#recipes">Card title</a>
              </h3>
              <p className={classes.meta}>author · v1.0.0</p>
            </div>
          </div>
          <p className={classes.body}>Card body copy in the muted foreground.</p>
          <footer className={classes.footer}>
            <a className={textLink()} href="#recipes">
              Details →
            </a>
          </footer>
        </article>
      </section>

      <section aria-labelledby="components">
        <h2 id="components">ui-sdk components ({examples.length})</h2>
        <div className="gallery-grid">
          {examples.map(({ name, Example }) => (
            <section key={name} className="gallery-cell" aria-label={name}>
              <h3>{name}</h3>
              <div className="gallery-demo">
                <Example />
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
