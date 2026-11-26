import { Switch, SwitchThumb } from "@ui-sdk/react/switch";

function Example() {
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <label>
        Airplane mode
        <Switch>
          <SwitchThumb />
        </Switch>
      </label>
      <label>
        Auto-update
        <Switch defaultChecked>
          <SwitchThumb />
        </Switch>
      </label>
    </div>
  );
}

export { Example };
