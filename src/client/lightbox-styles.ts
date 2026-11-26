import { css, cx } from "../../styled-system/css";

export const backdropStyle = css({
  position: "fixed",
  inset: "0",
  bg: "rgba(0, 0, 0, 0.78)",
  backdropFilter: "blur(4px)",
  transition: "opacity 160ms ease",
  "&[data-starting-style], &[data-ending-style]": { opacity: "0" },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

export const contentStyle = css({
  position: "fixed",
  inset: "0",
  m: "auto",
  w: "min(64rem, calc(100vw - 1.5rem))",
  h: "fit-content",
  maxH: "calc(100dvh - 1.5rem)",
  bg: "bg.surface",
  color: "fg",
  borderWidth: "2px",
  borderColor: "border.strong",
  rounded: "2xl",
  boxShadow: "raised",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  transition: "opacity 160ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1)",
  "&[data-starting-style], &[data-ending-style]": {
    opacity: "0",
    transform: "scale(0.97)",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

export const headerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "3",
  px: { base: "4", sm: "5" },
  py: "3",
  borderBottomWidth: "1px",
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
  fontSize: "lg",
  fontWeight: "bold",
  lineHeight: "1.2",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const counterStyle = css({
  flexShrink: "0",
  px: "2",
  py: "0.5",
  bg: "bg.subtle",
  borderWidth: "1px",
  borderColor: "border",
  rounded: "md",
  fontFamily: "mono",
  fontSize: "xs",
  color: "fg.muted",
});

export const actionsStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "2",
  flexShrink: "0",
});

export const iconButtonStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minW: "10",
  minH: "10",
  px: "2.5",
  bg: "bg.surface",
  color: "fg",
  borderWidth: "2px",
  borderColor: "border.strong",
  rounded: "lg",
  fontSize: "sm",
  fontWeight: "bold",
  lineHeight: "1",
  boxShadow: "offset",
  cursor: "pointer",
  textDecoration: "none",
  _hover: { bg: "bg.subtle", boxShadow: "raised", textDecoration: "none" },
  _active: { boxShadow: "none" },
});

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

const navButtonStyle = css({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  display: { base: "none", sm: "inline-flex" },
  alignItems: "center",
  justifyContent: "center",
  w: "11",
  h: "11",
  bg: "bg.surface",
  color: "fg",
  borderWidth: "2px",
  borderColor: "border.strong",
  rounded: "lg",
  fontSize: "xl",
  fontWeight: "bold",
  lineHeight: "1",
  boxShadow: "offset",
  cursor: "pointer",
  _hover: { bg: "accent", color: "accent.fg", boxShadow: "raised" },
  _active: { boxShadow: "none" },
});

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
  borderTopWidth: "1px",
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
  bg: "bg.subtle",
  borderWidth: "2px",
  borderColor: "border",
  rounded: "lg",
  cursor: "pointer",
  overflow: "hidden",
  _hover: { borderColor: "border.strong" },
  "&[aria-current=true]": {
    borderColor: "border.strong",
    bg: "accent",
    boxShadow: "offset",
  },
});

export const thumbImageStyle = css({
  display: "block",
  maxW: "full",
  maxH: "full",
  w: "auto",
  h: "auto",
  objectFit: "contain",
});
