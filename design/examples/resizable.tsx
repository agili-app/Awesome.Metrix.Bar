import { Resizable, ResizableHandle, ResizablePanel } from "@ui-sdk/react/resizable";

function Example() {
  return (
    <Resizable>
      <ResizablePanel defaultSize={30}>Files</ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel>Editor</ResizablePanel>
    </Resizable>
  );
}

export { Example };
