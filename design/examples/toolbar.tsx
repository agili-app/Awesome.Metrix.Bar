import { Toolbar, ToolbarButton, ToolbarSeparator } from "@ui-sdk/react/toolbar";

function Example() {
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarButton>Undo</ToolbarButton>
      <ToolbarButton>Redo</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton>Insert Link</ToolbarButton>
    </Toolbar>
  );
}

export { Example };
