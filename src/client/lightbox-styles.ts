import { css, cx } from "../../styled-system/css";
import { badge, button } from "../../styled-system/recipes";

export const backdropStyle = css({
  position: "fixed",
  inset: "0",
  backdropFilter: "blur(4px)",
  transition: "opacity 150ms ease",
  "&[data-starting-style], &[data-ending-style]": { opacity: "0" },
});

export const contentStyle = css({
  position: "fixed",
  inset: "0",
  m: "auto",
  w: "min(64rem, calc(100vw - 1.5rem))",
  h: "fit-content",
  maxH: "calc(100dvh - 1.5rem)",
  layerStyle: "offShadow",
  p: "0",
  gap: "0",
  color: "fg",
  fontSize: "md",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  transition: "opacity 160ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
  "&[data-starting-style], &[data-ending-style]": {
    opacity: "0",
    transform: "scale(0.97)",
  },
});

export const headerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  px: { base: "4", sm: "5" },
  py: "3",
  borderBottomWidth: "thin",
  borderColor: "border",
  minWidth: "0",
});

export const titleGroupStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "3",
  minWidth: "0",
});

export const titleStyle = css({
  textStyle: "title",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const counterStyle = badge();

export const actionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  flexShrink: "0",
});

export const actionButtonStyle = button({ visual: "outline", size: "sm" });
export const closeButtonStyle = button({ visual: "outline", size: "icon" });

export const stageStyle = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bg: "bg.subtle",
  px: { base: "3", sm: "14" },
  py: { base: "4", sm: "5" },
  minH: "0",
  overflow: "hidden",
});

const navButtonStyle = cx(
  button({ visual: "outline", size: "icon" }),
  css({
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    display: { base: "none", sm: "inline-flex" },
    w: "11",
    h: "11",
    fontSize: "xl",
    boxShadow: "md",
  }),
);

export const prevButtonStyle = cx(navButtonStyle, css({ left: { base: "2", sm: "3" } }));
export const nextButtonStyle = cx(navButtonStyle, css({ right: { base: "2", sm: "3" } }));

export const stageImageStyle = css({
  display: "block",
  maxW: "full",
  maxH: "calc(100dvh - 15rem)",
  w: "auto",
  h: "auto",
  objectFit: "contain",
  rounded: "lg",
});

export const footerStyle = css({
  display: "grid",
  gap: "3",
  px: { base: "4", sm: "5" },
  py: "3",
  borderTopWidth: "thin",
  borderColor: "border",
  justifyItems: "center",
});

export const captionStyle = css({
  fontSize: "sm",
  color: "fg.muted",
  textAlign: "center",
});

export const thumbsStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "2",
  flexWrap: "wrap",
});

export const thumbButtonStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  w: "14",
  h: "12",
  p: "1",
  bg: "bg.muted",
  borderWidth: "2px",
  borderColor: "border",
  rounded: "md",
  cursor: "pointer",
  overflow: "hidden",
  transitionProperty: "background-color, border-color",
  transitionDuration: "fast",
  _hover: { bg: "bg.muted.hover" },
  "&[aria-current=true]": { borderColor: "border.ink", bg: "accent.wash" },
});

export const thumbImageStyle = css({
  display: "block",
  maxW: "full",
  maxH: "full",
  w: "auto",
  h: "auto",
  objectFit: "contain",
});
