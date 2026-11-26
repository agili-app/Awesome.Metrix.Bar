import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog";

function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogDescription>
          The project and its files will be deleted for everyone.
        </AlertDialogDescription>
        <AlertDialogClose>Cancel</AlertDialogClose>
        <AlertDialogClose value="confirm">Delete</AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { Example };
