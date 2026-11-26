import { Toggle } from "@ui-sdk/react/toggle";

function Example() {
  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <Toggle>Bookmark</Toggle>
      <Toggle defaultPressed>Pinned</Toggle>
    </div>
  );
}

export { Example };
