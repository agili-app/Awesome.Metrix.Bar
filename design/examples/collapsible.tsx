import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible";

function Example() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Order details</CollapsibleTrigger>
      <CollapsiblePanel>2 × Linen shirt</CollapsiblePanel>
    </Collapsible>
  );
}

export { Example };
