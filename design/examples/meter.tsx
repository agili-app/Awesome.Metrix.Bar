import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@ui-sdk/react/meter";

function Example() {
  return (
    <Meter value={40}>
      <MeterLabel>Storage</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  );
}

export { Example };
