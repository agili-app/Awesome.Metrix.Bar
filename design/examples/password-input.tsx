import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputToggle,
} from "@ui-sdk/react/password-input";

function Example() {
  return (
    <PasswordInput name="password">
      <PasswordInputControl aria-label="Password" />
      <PasswordInputToggle aria-label="Show password" />
    </PasswordInput>
  );
}

export { Example };
