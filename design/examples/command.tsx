import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui-sdk/react/command";

function Example() {
  return (
    <Command>
      <CommandInput aria-label="Search commands" />
      <CommandEmpty>No commands found.</CommandEmpty>
      <CommandList>
        <CommandItem value="new-file">New file</CommandItem>
        <CommandItem value="new-folder">New folder</CommandItem>
      </CommandList>
    </Command>
  );
}

export { Example };
