interface ChapterFooterProps {
  chapterNumber: number;
  nextTitle: string;
  onNext: () => void;
}

// The bottom of a chapter: one large invitation into the next.
function ChapterFooter({
  chapterNumber,
  nextTitle,
  onNext,
}: ChapterFooterProps) {
  const nextNumber = String(chapterNumber + 1).padStart(2, "0");

  return (
    <section className="bg-ink text-ivory">
      <button
        type="button"
        onClick={onNext}
        className="group block w-full px-5 py-20 text-left md:px-10 md:py-32"
      >
        <span className="mx-auto block max-w-7xl">
          <span className="block font-sans text-body-s text-ivory/60">
            Next chapter
          </span>

          <span className="mt-4 flex items-baseline justify-between gap-8">
            <span className="font-display text-display-m leading-[0.95]">
              <span className="mr-5 text-sand">{nextNumber}</span>
              {nextTitle}
            </span>

            <span
              aria-hidden="true"
              className="shrink-0 font-display text-display-m transition-transform duration-300 group-hover:translate-x-2"
            >
              →
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}

export default ChapterFooter;
