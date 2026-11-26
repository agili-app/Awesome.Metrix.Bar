import { Field, FieldDescription, FieldError, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";

function UsernameField() {
  return (
    <Field name="username">
      <FieldLabel>Username</FieldLabel>
      <Input autoComplete="username" required />
      <FieldDescription>This is your public name.</FieldDescription>
      <FieldError />
    </Field>
  );
}

export { UsernameField as Example };
