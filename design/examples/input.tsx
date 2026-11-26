import { Input, InputClear, InputGroup } from "@ui-sdk/react/input";

function Example() {
  return (
    <InputGroup>
      <Input type="search" aria-label="Search" />
      <InputClear aria-label="Clear search" />
    </InputGroup>
  );
}

export { Example };
