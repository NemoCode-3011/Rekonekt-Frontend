// The marker the hall uses on its wall pictures: a steady ring, a dot in the
// middle, and a second ring that spreads and fades. Here it says "go closer".
// It takes its colour from the text colour around it.
export default function Beacon({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative grid size-4 shrink-0 place-items-center ${className}`}
    >
      <span className="absolute inset-0 rounded-full border border-current opacity-70" />
      <span className="absolute inset-0 rounded-full border border-current motion-safe:animate-beacon-wave" />
      <span className="size-1.5 rounded-full bg-current" />
    </span>
  );
}