import { Rating, RatingItem } from "@ui-sdk/react/rating";

function Example() {
  return (
    <Rating aria-label="Rating" defaultValue={3}>
      <RatingItem />
    </Rating>
  );
}

export { Example };
