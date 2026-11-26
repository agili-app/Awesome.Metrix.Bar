import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";

function Example() {
  return (
    <Menu>
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent>
        <MenuItem value="rename">Rename</MenuItem>
        <MenuItem value="duplicate">Duplicate</MenuItem>
      </MenuContent>
    </Menu>
  );
}

export { Example };
