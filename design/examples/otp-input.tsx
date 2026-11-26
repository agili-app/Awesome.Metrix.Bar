import { OTPInput, OTPInputGroup, OTPInputSlot } from "@ui-sdk/react/otp-input";

function Example() {
  return (
    <OTPInput maxLength={4} aria-label="Verification code">
      <OTPInputGroup>
        <OTPInputSlot index={0} />
        <OTPInputSlot index={1} />
        <OTPInputSlot index={2} />
        <OTPInputSlot index={3} />
      </OTPInputGroup>
    </OTPInput>
  );
}

export { Example };
