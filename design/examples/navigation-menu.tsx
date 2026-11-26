import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuViewport,
} from "@ui-sdk/react/navigation-menu";

function Example() {
  return (
    <NavigationMenu aria-label="Main">
      <NavigationMenuList>
        <NavigationMenuItem value="guides">
          <NavigationMenuTrigger>Guides</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/docs">Introduction</NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  );
}

export { Example };
