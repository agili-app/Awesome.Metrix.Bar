import { defineRecipe } from "@pandacss/dev";

export const textLinkRecipe = defineRecipe({
  className: "textLink",
  description: "Ink text with an accent underline. The mark is the affordance.",
  base: {
    color: "fg",
    fontWeight: "medium",
    textDecorationLine: "underline",
    textDecorationColor: "accent.emphasis",
    textDecorationThickness: "1px",
    textUnderlineOffset: "3px",
    transitionProperty: "background-color, text-decoration-color",
    transitionDuration: "fast",
    _hover: { bg: "accent.wash", textDecorationColor: "fg" },
  },
  variants: {
    tone: {
      default: {},
      muted: { color: "fg.muted", _hover: { color: "fg" } },
    },
  },
  defaultVariants: { tone: "default" },
});
