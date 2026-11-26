import { Button } from "@ui-sdk/react/button";

function Example() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      <Button>Default</Button>
      <Button data-variant="solid">Solid</Button>
      <Button data-variant="destructive">Destructive</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}

export { Example };
