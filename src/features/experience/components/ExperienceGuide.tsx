import { useEffect, useRef, useState } from "react";

// Shown once, the first time someone enters an experience.
// "Seen" is remembered in the browser so it doesn't appear again.
const STORAGE_KEY = "reko-experience-guide-seen";

const steps = [
  {
    title: "Move through the chapters",
    body: "An exhibition is told as a sequence of chapters. Scroll to read, then use the dots or the Next button to continue. If you're signed in, REKÒ remembers where you stopped.",
  },
  {
    title: "Look closer",
    body: "Select an artifact, person or place to open its details. Use the bookmark icon to save anything you want to come back to.",
  },
  {
    title: "Follow the evidence",
    body: "Each chapter lists its sources, so you can see where the information comes from and read further yourself.",
  },
];

function alreadySeen() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "yes";
  } catch {
    return false; // storage blocked: just show the guide
  }
}

function markSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "yes");
  } catch {
    // nothing to do
  }
}

function ExperienceGuide() {
  const [open, setOpen] = useState(() => !alreadySeen());
  const [step, setStep] = useState(0);
  const primaryRef = useRef<HTMLButtonElement>(null);

  function close() {
    markSeen();
    setOpen(false);
  }

  // Esc closes the guide, and the main button is focused when it opens.
  useEffect(() => {
    if (!open) return;

    primaryRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        markSeen();
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 px-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        className="w-full max-w-lg bg-ivory p-8 text-ink md:p-10"
      >
        <p className="font-sans text-label font-medium uppercase tracking-[0.18em] text-ochre">
          How this works · {step + 1} of {steps.length}
        </p>

        <h2
          id="guide-title"
          className="mt-4 font-display text-heading-m leading-tight"
        >
          {current.title}
        </h2>

        <p className="mt-4 font-sans text-body-m text-muted">{current.body}</p>

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={close}
            className="font-sans text-body-s text-muted underline underline-offset-4 hover:text-ink"
          >
            Skip
          </button>

          <button
            ref={primaryRef}
            type="button"
            onClick={() => (isLast ? close() : setStep(step + 1))}
            className="h-12 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
          >
            {isLast ? "Start exploring" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExperienceGuide;
