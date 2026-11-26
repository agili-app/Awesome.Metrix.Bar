import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuInput,
  TriggerMenuItem,
  TriggerMenuList,
} from "@ui-sdk/react/trigger-menu";

function Example() {
  return (
    <TriggerMenu triggers={[{ char: "@" }]}>
      <TriggerMenuInput aria-label="Message" placeholder="Type @ to mention someone…" />
      <TriggerMenuContent>
        <TriggerMenuList>
          <TriggerMenuItem value="hollis" label="Hollis Grant">
            Hollis Grant
          </TriggerMenuItem>
          <TriggerMenuItem value="ines" label="Inès Moreau">
            Inès Moreau
          </TriggerMenuItem>
        </TriggerMenuList>
      </TriggerMenuContent>
    </TriggerMenu>
  );
}

export { Example };
