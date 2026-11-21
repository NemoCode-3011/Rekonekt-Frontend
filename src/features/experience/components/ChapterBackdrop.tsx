import { motion, useReducedMotion } from "framer-motion";

interface ChapterBackdropProps {
  number: number;
}

// Used when a chapter has no photograph of its own, so it never repeats
// another chapter's picture. A dark field, a warm glow and the chapter number
// set very large. The glow changes side from one chapter to the next.
function ChapterBackdrop({ number }: ChapterBackdropProps) {
  const reduce = useReducedMotion();
  const flip = number % 2 === 0;

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-ink">
      <div
        className={`absolute inset-0 ${
          flip
            ? "bg-[radial-gradient(ellipse_at_20%_15%,rgba(166,106,63,0.38),transparent_60%)]"
            : "bg-[radial-gradient(ellipse_at_80%_15%,rgba(166,106,63,0.38),transparent_60%)]"
        }`}
      />
      <div
        className={`absolute inset-0 ${
          flip
            ? "bg-[radial-gradient(ellipse_at_85%_95%,rgba(11,93,59,0.4),transparent_55%)]"
            : "bg-[radial-gradient(ellipse_at_10%_95%,rgba(11,93,59,0.4),transparent_55%)]"
        }`}
      />

      <motion.span
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={`absolute top-1/2 -translate-y-1/2 select-none font-display text-[clamp(16rem,55vw,44rem)] leading-none tracking-tighter text-ivory/6
          flip ? "-left-6" : "-right-6"
        }`}
      >
        {String(number).padStart(2, "0")}
      </motion.span>

      <div className="absolute inset-0 bg-linear-to-t from-ink via-transparent to-ink/40" />
    </div>
  );
}

export default ChapterBackdrop;