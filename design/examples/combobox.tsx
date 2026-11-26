import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@ui-sdk/react/combobox";

function Example() {
  return (
    <Combobox>
      <ComboboxLabel>Fruit</ComboboxLabel>
      <ComboboxInput placeholder="Search fruits…" />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="apple">Apple</ComboboxItem>
          <ComboboxItem value="banana">Banana</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

export { Example };
