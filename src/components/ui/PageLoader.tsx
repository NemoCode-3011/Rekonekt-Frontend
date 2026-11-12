import { motion, useReducedMotion } from "framer-motion";

interface PageLoaderProps {
  label?: string;
  tone?: "light" | "dark";
  fullScreen?: boolean;
}

export default function PageLoader({
  label = "Loading…",
  tone = "light",
  fullScreen = false,
}: PageLoaderProps) {
  const reduce = useReducedMotion();
  const dark = tone === "dark";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-6 px-5 py-20 ${
        fullScreen ? "min-h-screen" : ""
      } ${dark ? "bg-ink text-ivory" : "text-ink"}`}
    >
      <span className="font-display text-heading-s tracking-[0.3em]">REKÒ</span>

      <span
        className={`relative block h-px w-40 overflow-hidden ${
          dark ? "bg-ivory/20" : "bg-line"
        }`}
      >
        <motion.span
          className="absolute inset-y-0 left-0 w-1/3 bg-ochre"
          animate={reduce ? undefined : { x: ["-100%", "300%"] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>

      <span
        className={`text-body-s ${dark ? "text-ivory/60" : "text-muted"}`}
      >
        {label}
      </span>
    </div>
  );
}