import { TokenInput, TokenInputEditor, type TokenInputValue } from "@ui-sdk/react/token-input";

const draft: TokenInputValue = [
  "Explain ",
  { type: "file", value: "src/routes.ts", label: "routes.ts" },
];

function Example() {
  return (
    <TokenInput defaultValue={draft}>
      <TokenInputEditor aria-label="Prompt" />
    </TokenInput>
  );
}

export { Example };
