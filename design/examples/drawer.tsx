import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@ui-sdk/react/drawer";

function Example() {
  return (
    <Drawer>
      <DrawerTrigger>Filters</DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerTitle>Filters</DrawerTitle>
        <DrawerDescription>Narrow down the results.</DrawerDescription>
        <DrawerClose>Done</DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

export { Example };
