import {
  NumberInput,
  NumberInputGroup,
  NumberInputControl,
  NumberInputDecrement,
  NumberInputIncrement,
} from "@ui-sdk/react/number-input";

function Example() {
  return (
    <NumberInput defaultValue={1} min={0}>
      <NumberInputGroup>
        <NumberInputDecrement aria-label="Decrease" />
        <NumberInputControl aria-label="Quantity" />
        <NumberInputIncrement aria-label="Increase" />
      </NumberInputGroup>
    </NumberInput>
  );
}

export { Example };
