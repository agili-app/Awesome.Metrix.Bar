import { defineConfig } from "@pandacss/dev";
import { globalCss } from "./theme/global-css.ts";
import { layerStyles } from "./theme/layer-styles.ts";
import { recipes, slotRecipes } from "./theme/recipes/index.ts";
import { semanticTokens } from "./theme/semantic-tokens.ts";
import { textStyles } from "./theme/text-styles.ts";
import { tokens } from "./theme/tokens.ts";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  preflight: true,
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  conditions: {
    extend: {
      dark: "@media (prefers-color-scheme: dark)",
      cjk: "&:is(:lang(zh), :lang(ja), :lang(ko))",
    },
  },
  theme: {
    extend: { tokens, semanticTokens, textStyles, layerStyles, recipes, slotRecipes },
  },
  globalCss,
});
