import {
  Carousel,
  CarouselViewport,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@ui-sdk/react/carousel";

function FeaturedSlides() {
  return (
    <Carousel aria-label="Featured">
      <CarouselViewport>
        <CarouselContent>
          <CarouselItem>First slide</CarouselItem>
          <CarouselItem>Second slide</CarouselItem>
        </CarouselContent>
      </CarouselViewport>
      <CarouselPrevious aria-label="Previous slide" />
      <CarouselNext aria-label="Next slide" />
    </Carousel>
  );
}

export { FeaturedSlides as Example };
