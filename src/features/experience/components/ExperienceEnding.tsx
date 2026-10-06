import { Link } from "react-router-dom";

interface ExperienceEndingProps {
  experienceTitle: string;
  onRestart: () => void;
}

const rowClass =
  "group flex w-full items-center justify-between gap-6 py-6 text-left md:py-8";

// What the reader sees after the final chapter.
function ExperienceEnding({ experienceTitle, onRestart }: ExperienceEndingProps) {
  return (
    <section className="bg-deep-forest text-ivory">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-36">
        <h2 className="max-w-3xl font-display text-display-m leading-[0.95]">
          Where do you want to go next?
        </h2>

        <p className="mt-6 max-w-xl font-sans text-body-l text-ivory/75">
          You've reached the end of {experienceTitle}. The people, places and
          objects from each chapter are still here to look at again.
        </p>

        <ul className="mt-14 divide-y divide-line-light border-y border-line-light">
          <li>
            <Link to="/explore/exhibitions" className={rowClass}>
              <span>
                <span className="block font-display text-heading-s">
                  More exhibitions
                </span>
                <span className="mt-1 block font-sans text-body-s text-ivory/65">
                  See what else REKÒ has to explore.
                </span>
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>

          <li>
            <Link to="/explore" className={rowClass}>
              <span>
                <span className="block font-display text-heading-s">
                  Explore REKÒ
                </span>
                <span className="mt-1 block font-sans text-body-s text-ivory/65">
                  Browse everything REKÒ holds.
                </span>
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </li>

          <li>
            <button type="button" onClick={onRestart} className={rowClass}>
              <span>
                <span className="block font-display text-heading-s">
                  Begin again
                </span>
                <span className="mt-1 block font-sans text-body-s text-ivory/65">
                  Return to the first chapter.
                </span>
              </span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default ExperienceEnding;