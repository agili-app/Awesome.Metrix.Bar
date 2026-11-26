import {
  ImageCropper,
  ImageCropperHandle,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@ui-sdk/react/image-cropper";

const src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="#fde047"/><circle cx="300" cy="150" r="90" fill="#111"/></svg>')}`;

function CoverPhoto() {
  return (
    <ImageCropper aria-label="Cover photo" src={src} aspectRatio={3}>
      <ImageCropperViewport>
        <ImageCropperImage alt="Your cover photo" />
        <ImageCropperSelection>
          <ImageCropperHandle position="nw" />
          <ImageCropperHandle position="se" />
        </ImageCropperSelection>
      </ImageCropperViewport>
    </ImageCropper>
  );
}

export { CoverPhoto as Example };
