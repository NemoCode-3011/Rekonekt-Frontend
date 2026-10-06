import { motion } from "framer-motion";

interface CinematicImageProps {
  src: string;
  alt: string;
  focus?: string;
}

function CinematicImage({
  src,
  alt,
  focus = "50% 30%",
}: CinematicImageProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        style={{ objectPosition: focus }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{
          duration: 1.2,
          ease: "easeOut",
        }}
        className="h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-ink/35" />

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />
    </div>
  );
}

export default CinematicImage;