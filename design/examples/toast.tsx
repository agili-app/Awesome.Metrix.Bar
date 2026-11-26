import { Toast, ToastDescription, ToastRegion, ToastTitle, toast } from "@ui-sdk/react/toast";
import { Button } from "@ui-sdk/react/button";

function Example() {
  return (
    <>
      <Button onClick={() => toast("Event created", { description: "Friday at 10:00 AM" })}>
        Create Event
      </Button>
      <ToastRegion>
        {() => (
          <Toast>
            <ToastTitle />
            <ToastDescription />
          </Toast>
        )}
      </ToastRegion>
    </>
  );
}

export { Example };
