interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  maxHeight?: string; // a Tailwind max-height class
  loading?: "eager" | "lazy";
}

// Shows a picture at its own proportions. Very tall pictures are capped to the
// screen height and shown whole, with a soft blurred copy filling the sides.
export default function AdaptiveImage({
  src,
  alt,
  className = "",
  maxHeight = "max-h-[75svh]",
  loading = "lazy",
}: AdaptiveImageProps) {
  return (
    <div className={`relative isolate overflow-hidden bg-sand/40 ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        loading={loading}
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
      />
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`block h-auto w-full object-contain ${maxHeight}`}
      />
    </div>
  );
}
