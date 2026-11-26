import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";

function Example() {
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <label>
        <Checkbox>
          <CheckboxIndicator aria-hidden="true" />
        </Checkbox>
        Accept terms and conditions
      </label>
      <label>
        <Checkbox defaultChecked>
          <CheckboxIndicator aria-hidden="true" />
        </Checkbox>
        Subscribe to updates
      </label>
    </div>
  );
}

export { Example };
