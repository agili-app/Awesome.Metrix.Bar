import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";

function Example() {
  return (
    <Field>
      <FieldLabel>Shipping speed</FieldLabel>
      <RadioGroup defaultValue="standard">
        <label>
          <Radio value="standard">
            <RadioIndicator />
          </Radio>
          Standard
        </label>
        <label>
          <Radio value="express">
            <RadioIndicator />
          </Radio>
          Express
        </label>
      </RadioGroup>
    </Field>
  );
}

export { Example };
