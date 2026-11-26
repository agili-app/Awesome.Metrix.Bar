import { defineGlobalStyles } from "@pandacss/dev";
import { uiSdkGlobalCss } from "./ui-sdk.ts";

export const globalCss = defineGlobalStyles({
  ...uiSdkGlobalCss,
  // Default border color via preflight's variable, so web.css borders keep their own colors.
  html: {
    colorScheme: "light dark",
    scrollPaddingTop: "6",
    "--global-color-border": "token(colors.border)",
  },
  body: {
    bg: "bg",
    color: "fg",
    fontFamily: "sans",
    lineHeight: "1.65",
    overflowWrap: "anywhere",
  },
  ":where(a, button, input, textarea, select, summary, [data-slot], [tabindex]:not([tabindex='-1'])):focus-visible":
    {
      outline: "2px solid token(colors.focusRing)",
      outlineOffset: "2px",
    },
  "::selection": { bg: "accent.subtle", color: "fg" },
  "@media (prefers-reduced-motion: reduce)": {
    "*, *::before, *::after": {
      animationDuration: "0.01ms!",
      animationIterationCount: "1!",
      transitionDuration: "0.01ms!",
      scrollBehavior: "auto!",
    },
  },
});
