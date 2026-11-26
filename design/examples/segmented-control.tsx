import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";

function Example() {
  return (
    <SegmentedControl aria-label="View" defaultValue="list">
      <SegmentedControlIndicator />
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
    </SegmentedControl>
  );
}

export { Example };
