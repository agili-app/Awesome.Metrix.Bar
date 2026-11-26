import { defineRecipe } from "@pandacss/dev";

export const buttonRecipe = defineRecipe({
  className: "button",
  description:
    "Actions. Funky visuals grow their shadow on hover; outline only changes background.",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    height: "auto",
    fontWeight: "semibold",
    lineHeight: "1.2",
    textAlign: "center",
    textDecoration: "none",
    whiteSpace: "nowrap",
    cursor: "pointer",
    transitionProperty: "background-color, box-shadow",
    transitionDuration: "fast",
    _disabled: { opacity: "0.5", cursor: "not-allowed", boxShadow: "none" },
    "&[data-pending]": { cursor: "wait" },
  },
  variants: {
    visual: {
      main: {
        bg: "accent",
        color: "fg.onAccent",
        borderWidth: "thick",
        borderColor: "border.ink",
        rounded: "control",
        boxShadow: "offset",
        _hover: { boxShadow: "offset.raised" },
      },
      secondary: {
        bg: "bg.surface",
        color: "fg",
        borderWidth: "thick",
        borderColor: "border.ink",
        rounded: "control",
        boxShadow: "offset",
        _hover: { boxShadow: "offset.raised" },
      },
      outline: {
        bg: "bg.surface",
        color: "fg",
        borderWidth: "thin",
        borderColor: "border",
        rounded: "md",
        _hover: { bg: "bg.muted" },
      },
    },
    size: {
      sm: { minHeight: "9", px: "3.5", fontSize: "sm" },
      md: { minHeight: "12", px: "6", fontSize: "md", letterSpacing: "tight" },
      icon: { minWidth: "10", minHeight: "10", px: "2.5", fontSize: "md" },
    },
  },
  defaultVariants: { visual: "main", size: "md" },
});
