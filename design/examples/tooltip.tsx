import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";

function Example() {
  return (
    <Tooltip>
      <TooltipTrigger>Share</TooltipTrigger>
      <TooltipContent>Anyone with the link can view</TooltipContent>
    </Tooltip>
  );
}

export { Example };
