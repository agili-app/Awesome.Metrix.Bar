import { defineSemanticTokens } from "@pandacss/dev";

// Light and dark values live here only; components never branch on `_dark`.
export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.ink}" } },
      subtle: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
      muted: {
        DEFAULT: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
        hover: { value: { base: "{colors.neutral.200}", _dark: "{colors.neutral.700}" } },
      },
      surface: { value: { base: "{colors.white}", _dark: "{colors.neutral.900}" } },
      inverted: { value: { base: "{colors.ink}", _dark: "{colors.neutral.100}" } },
      main: { value: { base: "{colors.yellow.300}", _dark: "{colors.neutral.700}" } },
      emphasized: {
        DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.yellow.300}" } },
        hover: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
      },
      overlay: { value: { base: "{colors.blackAlpha.700}", _dark: "{colors.blackAlpha.800}" } },
    },
    fg: {
      DEFAULT: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
      muted: { value: { base: "{colors.neutral.600}", _dark: "{colors.neutral.300}" } },
      subtle: { value: { base: "{colors.neutral.500}", _dark: "{colors.neutral.400}" } },
      inverted: { value: { base: "{colors.white}", _dark: "{colors.ink}" } },
      headline: { value: { base: "{colors.black}", _dark: "{colors.yellow.300}" } },
      onAccent: { value: "{colors.ink}" },
    },
    accent: {
      DEFAULT: { value: { base: "{colors.yellow.400}", _dark: "{colors.yellow.300}" } },
      emphasis: { value: { base: "{colors.yellow.500}", _dark: "{colors.yellow.200}" } },
      subtle: { value: { base: "{colors.yellow.200}", _dark: "#414012" } },
      wash: { value: { base: "{colors.yellow.100}", _dark: "rgba(253, 224, 71, 0.12)" } },
    },
    link: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
      emphasized: { value: { base: "{colors.blue.700}", _dark: "{colors.blue.300}" } },
    },
    border: {
      DEFAULT: { value: { base: "{colors.neutral.200}", _dark: "{colors.neutral.700}" } },
      muted: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
      // The funky outline: ink on light, lifted in dark so edges stay visible on the ink canvas.
      ink: { value: { base: "{colors.ink}", _dark: "{colors.neutral.500}" } },
    },
    danger: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
    focusRing: { value: { base: "{colors.ink}", _dark: "{colors.yellow.300}" } },
  },
  shadows: {
    offset: {
      DEFAULT: { value: "4px 4px 0 0 {colors.border.ink}" },
      raised: { value: "6px 6px 0 0 {colors.border.ink}" },
    },
  },
});
