import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";
import { Menubar } from "@ui-sdk/react/menubar";

function Example() {
  return (
    <Menubar aria-label="Application">
      <Menu>
        <MenuTrigger>File</MenuTrigger>
        <MenuContent>
          <MenuItem>New file</MenuItem>
          <MenuItem>Open file</MenuItem>
        </MenuContent>
      </Menu>
      <Menu>
        <MenuTrigger>Edit</MenuTrigger>
        <MenuContent>
          <MenuItem>Undo</MenuItem>
          <MenuItem>Redo</MenuItem>
        </MenuContent>
      </Menu>
    </Menubar>
  );
}

export { Example };
