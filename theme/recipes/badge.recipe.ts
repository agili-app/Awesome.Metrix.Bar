import { defineRecipe } from "@pandacss/dev";

export const badgeRecipe = defineRecipe({
  className: "badge",
  description: "Short mono labels such as categories and counters.",
  base: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: "0",
    px: "2",
    py: "0.5",
    rounded: "sm",
    fontFamily: "mono",
    fontSize: "xs",
    fontWeight: "medium",
    lineHeight: "1.4",
  },
  variants: {
    visual: {
      outline: { bg: "bg", color: "fg.muted", borderWidth: "thin", borderColor: "border" },
      solid: { bg: "bg.inverted", color: "fg.inverted" },
    },
  },
  defaultVariants: { visual: "outline" },
});
