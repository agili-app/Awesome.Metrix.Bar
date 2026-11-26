import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from "@ui-sdk/react/scroll-area";

function ReleaseNotes() {
  return (
    <ScrollArea>
      <ScrollAreaViewport role="region" aria-label="Release notes">
        <ScrollAreaContent>Content to scroll</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar orientation="vertical">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
    </ScrollArea>
  );
}

export { ReleaseNotes as Example };
