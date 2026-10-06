import { useModalDialog } from "../useModalDialog";

interface ImageLightboxProps {
  src: string;
  alt: string;
  caption: string | null;
  onClose: () => void;
}

// A full-screen viewer for one picture.
function ImageLightbox({ src, alt, caption, onClose }: ImageLightboxProps) {
  const { dialogRef, close, closeOnBackdropClick } = useModalDialog();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={closeOnBackdropClick}
      aria-label={alt}
      className="m-auto max-h-[94svh] max-w-[94vw] bg-transparent p-0 text-ivory backdrop:bg-ink/90"
    >
      <div className="flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={close}
          className="px-2 py-2 font-sans text-body-s text-ivory/80 hover:text-ivory"
        >
          Close
        </button>

        <img
          src={src}
          alt={alt}
          className="max-h-[80svh] max-w-full object-contain"
        />

        {caption && (
          <p className="max-w-2xl self-start font-sans text-body-s text-ivory/70">
            {caption}
          </p>
        )}
      </div>
    </dialog>
  );
}

export default ImageLightbox;