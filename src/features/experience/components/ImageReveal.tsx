import { useState } from "react";

interface ImageRevealProps {
  src: string;
  alt: string;
}

function ImageReveal({ src, alt }: ImageRevealProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`overflow-hidden transition-opacity duration-1000 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export default ImageReveal;