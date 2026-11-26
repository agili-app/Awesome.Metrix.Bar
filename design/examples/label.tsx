import { Label } from "@ui-sdk/react/label";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";

function Plan() {
  return (
    <>
      <Label htmlFor="plan">Plan</Label>
      <RadioGroup id="plan" defaultValue="pro">
        <label>
          <Radio value="free">
            <RadioIndicator />
          </Radio>
          Free
        </label>
        <label>
          <Radio value="pro">
            <RadioIndicator />
          </Radio>
          Pro
        </label>
      </RadioGroup>
    </>
  );
}

export { Plan as Example };
