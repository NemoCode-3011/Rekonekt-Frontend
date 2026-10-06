import { Link } from "react-router-dom";
import type { Section } from "../types/sections";

interface ChapterListProps {
  experienceSlug: string;
  sections: Section[];
}

// The blurb is the first paragraph of the section introduction.
function blurb(section: Section) {
  return section.introduction?.split(/\n+/).find(Boolean) ?? null;
}

function ChapterList({ experienceSlug, sections }: ChapterListProps) {
  if (sections.length === 0) return null;

  return (
    <section
      aria-labelledby="chapters-heading"
      className="border-t border-line"
    >
      <div className="container grid gap-10 py-16 md:grid-cols-12 md:gap-12 md:py-24 lg:gap-16">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-12">
            <h2 id="chapters-heading" className="text-heading-l leading-[1.05]">
              Chapters
            </h2>
            <p className="mt-4 max-w-xs font-sans text-body-m text-muted">
              Start at the beginning, or step in at any chapter.
            </p>
          </div>
        </div>

        <ol className="divide-y divide-line border-y border-line md:col-span-8">
          {sections.map((section, index) => {
            const text = blurb(section);

            return (
              <li key={section.id}>
                <Link
                  to={`/experiences/${experienceSlug}?chapter=${section.slug}`}
                  className="group grid grid-cols-[2.75rem_1fr_auto] items-baseline gap-4 py-8 md:grid-cols-[4.5rem_1fr_auto] md:gap-8 md:py-10"
                >
                  <span className="font-display text-heading-m leading-none text-ochre">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="font-display text-heading-m leading-[1.1] transition-colors group-hover:text-heritage-green">
                      {section.title}
                    </h3>
                    {text && (
                      <p className="mt-3 line-clamp-2 max-w-xl font-sans text-body-m leading-relaxed text-muted">
                        {text}
                      </p>
                    )}
                  </div>

                  <span
                    aria-hidden="true"
                    className="text-heading-s text-ink/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-heritage-green"
                  >
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export default ChapterList;
