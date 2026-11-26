import { defineTextStyles } from "@pandacss/dev";

// Negative tracking crushes CJK glyphs, so `_cjk` resets it to normal.
export const textStyles = defineTextStyles({
  eyebrow: {
    value: {
      fontFamily: "mono",
      fontSize: "xs",
      fontWeight: "medium",
      lineHeight: "1",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  },
  display: {
    value: {
      fontSize: { base: "2.5rem", md: "3.25rem", lg: "4rem" },
      fontWeight: "bold",
      lineHeight: "1.05",
      letterSpacing: { base: "-0.03em", _cjk: "normal" },
      textWrap: "balance",
    },
  },
  lead: {
    value: {
      fontSize: { base: "lg", md: "xl" },
      fontWeight: "medium",
      lineHeight: "1.5",
      letterSpacing: { base: "tight", _cjk: "normal" },
    },
  },
  heading: {
    value: {
      fontSize: { base: "1.625rem", lg: "1.875rem" },
      fontWeight: "bold",
      lineHeight: "1.2",
      letterSpacing: { base: "tight", _cjk: "normal" },
    },
  },
  title: {
    value: {
      fontSize: "lg",
      fontWeight: "semibold",
      lineHeight: "1.3",
      letterSpacing: { base: "tight", _cjk: "normal" },
    },
  },
});
