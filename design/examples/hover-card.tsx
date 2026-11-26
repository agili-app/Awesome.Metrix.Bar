import { HoverCard, HoverCardContent, HoverCardTrigger } from "@ui-sdk/react/hover-card";

function Example() {
  return (
    <HoverCard>
      <HoverCardTrigger href="/people/hollis">@hollis</HoverCardTrigger>
      <HoverCardContent>
        <p>Hollis Grant</p>
        <p>Design engineer on the payments team.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export { Example };
