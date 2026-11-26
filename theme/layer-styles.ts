import { defineLayerStyles } from "@pandacss/dev";

export const layerStyles = defineLayerStyles({
  // The funky surface: reserved for primary panels, never for repeated list items.
  offShadow: {
    value: {
      backgroundColor: "bg.surface",
      borderWidth: "thick",
      borderColor: "border.ink",
      borderRadius: "control",
      boxShadow: "offset",
    },
  },
  card: {
    value: {
      backgroundColor: "bg.surface",
      borderWidth: "thin",
      borderColor: "border",
      borderRadius: "lg",
    },
  },
});
