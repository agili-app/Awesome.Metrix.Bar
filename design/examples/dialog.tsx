import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>Project details</DialogTitle>
        <DialogDescription>Review the details before continuing.</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export { Example };
