// A small two-handled urn: the same object the card turns in 3D, drawn flat.
export default function UrnMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        fill="currentColor"
        d="M8 3H16L15.2 5.4C15.2 6.6 18.2 8.2 18.2 12.4C18.2 16.4 15.8 18.6 15.4 20L16.4 21.4H7.6L8.6 20C8.2 18.6 5.8 16.4 5.8 12.4C5.8 8.2 8.8 6.6 8.8 5.4Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        d="M8.9 5.9C4.2 5.4 3.4 11.6 6.2 13.2M15.1 5.9C19.8 5.4 20.6 11.6 17.8 13.2"
      />
    </svg>
  );
}