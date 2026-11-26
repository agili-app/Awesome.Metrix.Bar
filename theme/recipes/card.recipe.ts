import { defineSlotRecipe } from "@pandacss/dev";

export const cardRecipe = defineSlotRecipe({
  className: "card",
  description: "A catalog card. Hover softens the background only, with no lift or border shift.",
  slots: ["root", "header", "title", "meta", "body", "footer"],
  base: {
    root: {
      layerStyle: "card",
      display: "flex",
      flexDirection: "column",
      gap: "4",
      minWidth: "0",
      p: { base: "5", md: "6" },
      transitionProperty: "background-color",
      transitionDuration: "fast",
      _hover: { bg: "bg.subtle" },
    },
    header: {
      display: "flex",
      alignItems: "start",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "3",
    },
    title: {
      textStyle: "title",
      "& a": { textDecoration: "none", _hover: { textDecoration: "underline" } },
    },
    meta: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "1.5",
      mt: "1.5",
      fontSize: "xs",
      color: "fg.muted",
    },
    body: { fontSize: "sm", lineHeight: "1.6", color: "fg.muted", whiteSpace: "pre-line" },
    footer: {
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "4",
      mt: "auto",
      pt: "4",
      borderTopWidth: "thin",
      borderColor: "border",
      fontSize: "sm",
    },
  },
});
