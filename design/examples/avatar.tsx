import { Avatar, AvatarFallback, AvatarImage } from "@ui-sdk/react/avatar";

function Example() {
  return (
    <Avatar>
      <AvatarImage src="/missing-avatar.png" alt="Ada Lovelace" />
      <AvatarFallback>AL</AvatarFallback>
    </Avatar>
  );
}

export { Example };
