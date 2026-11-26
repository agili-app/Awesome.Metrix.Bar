import { defineTokens } from "@pandacss/dev";

// Primitive additions on top of @pandacss/preset-panda, taken from the panda-css.com theme.
export const tokens = defineTokens({
  colors: {
    ink: { value: "#111" },
    blackAlpha: {
      50: { value: "rgba(0, 0, 0, 0.04)" },
      100: { value: "rgba(0, 0, 0, 0.06)" },
      200: { value: "rgba(0, 0, 0, 0.08)" },
      300: { value: "rgba(0, 0, 0, 0.16)" },
      400: { value: "rgba(0, 0, 0, 0.24)" },
      500: { value: "rgba(0, 0, 0, 0.36)" },
      600: { value: "rgba(0, 0, 0, 0.48)" },
      700: { value: "rgba(0, 0, 0, 0.64)" },
      800: { value: "rgba(0, 0, 0, 0.80)" },
      900: { value: "rgba(0, 0, 0, 0.92)" },
    },
    whiteAlpha: {
      50: { value: "rgba(255, 255, 255, 0.04)" },
      100: { value: "rgba(255, 255, 255, 0.06)" },
      200: { value: "rgba(255, 255, 255, 0.08)" },
      300: { value: "rgba(255, 255, 255, 0.16)" },
      400: { value: "rgba(255, 255, 255, 0.24)" },
      500: { value: "rgba(255, 255, 255, 0.36)" },
      600: { value: "rgba(255, 255, 255, 0.48)" },
      700: { value: "rgba(255, 255, 255, 0.64)" },
      800: { value: "rgba(255, 255, 255, 0.80)" },
      900: { value: "rgba(255, 255, 255, 0.92)" },
    },
  },
  borderWidths: {
    thin: { value: "1px" },
    thick: { value: "3px" },
  },
  radii: {
    control: { value: "13px" },
  },
});
