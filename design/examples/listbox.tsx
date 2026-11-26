import { Listbox, ListboxItem, ListboxItemIndicator } from "@ui-sdk/react/listbox";

function Example() {
  return (
    <Listbox aria-label="Toppings" defaultValue="basil">
      <ListboxItem value="basil">
        Basil
        <ListboxItemIndicator />
      </ListboxItem>
      <ListboxItem value="olive">
        Olive
        <ListboxItemIndicator />
      </ListboxItem>
    </Listbox>
  );
}

export { Example };
