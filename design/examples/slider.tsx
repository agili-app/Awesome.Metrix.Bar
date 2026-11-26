import {
  Slider,
  SliderValue,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
} from "@ui-sdk/react/slider";

function VolumeSlider() {
  return (
    <Slider defaultValue={50}>
      <SliderValue />
      <SliderControl>
        <SliderTrack>
          <SliderIndicator />
          <SliderThumb aria-label="Volume" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  );
}

export { VolumeSlider as Example };
