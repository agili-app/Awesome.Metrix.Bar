import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";

function Example() {
  return (
    <Popover>
      <PopoverTrigger>Share</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Share this document</PopoverTitle>
        <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
        <PopoverClose>Done</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

export { Example };
