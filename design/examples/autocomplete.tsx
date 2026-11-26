import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
} from "@ui-sdk/react/autocomplete";

function Example() {
  return (
    <Autocomplete>
      <AutocompleteLabel>Fruit</AutocompleteLabel>
      <AutocompleteInput placeholder="Type a fruit…" />
      <AutocompleteContent>
        <AutocompleteList>
          <AutocompleteItem value="Apple">Apple</AutocompleteItem>
          <AutocompleteItem value="Banana">Banana</AutocompleteItem>
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}

export { Example };
