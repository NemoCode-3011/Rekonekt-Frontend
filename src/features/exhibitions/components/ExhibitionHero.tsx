import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatYearRange } from "../../../lib/dates";
import type { Exhibition } from "../types/exhibitions";

const ease = [0.22, 1, 0.36, 1] as const;

interface ExhibitionHeroProps {
  exhibition: Exhibition;
  chapterCount: number;
}

function CoverImage({ exhibition }: { exhibition: Exhibition }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="absolute inset-0"
      initial={reduce ? false : { clipPath: "inset(10% 8% 10% 8%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 1.2, ease }}
    >
      {exhibition.cover_image_url ? (
        <img
          src={exhibition.cover_image_url}
          alt={exhibition.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 size-72 rounded-full border border-ivory/15 md:size-96"
          />
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-12 size-52 rounded-full border border-ivory/10 md:size-72"
          />
        </>
      )}
    </motion.div>
  );
}

function ExhibitionHero({ exhibition, chapterCount }: ExhibitionHeroProps) {
  const years = formatYearRange(exhibition.start_date, exhibition.end_date);
  const paragraphs = exhibition.description?.split(/\n+/).filter(Boolean) ?? [];

  return (
    <section className="container grid gap-10 py-10 md:grid-cols-12 md:gap-12 md:py-16 lg:gap-16">
      <div className="relative order-first aspect-[4/3] overflow-hidden bg-deep-forest md:order-last md:col-span-7 md:aspect-auto md:min-h-[34rem]">
        <CoverImage exhibition={exhibition} />
      </div>

      <div className="flex flex-col justify-end md:col-span-5">
        {years && (
          <p className="font-display text-heading-l leading-none tracking-[-0.03em] text-ochre">
            {years}
          </p>
        )}

        <h1 className="mt-5 text-display-m leading-[0.95] text-ink">
          {exhibition.title}
        </h1>

        {exhibition.subtitle && (
          <p className="mt-6 font-sans text-body-l text-muted">
            {exhibition.subtitle}
          </p>
        )}

        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className="mt-5 max-w-[34rem] font-sans text-body-m leading-[1.75] text-ink/80"
          >
            {paragraph}
          </p>
        ))}

        {chapterCount > 0 && (
          <Link
            to={`/experiences/${exhibition.slug}`}
            className="group mt-10 flex items-center justify-between gap-6 bg-deep-forest px-6 py-5 text-ivory transition-colors hover:bg-heritage-green md:px-8 md:py-6"
          >
            <span>
              <span className="block font-display text-heading-s">
                Enter Experience
              </span>
              <span className="mt-1 block font-sans text-body-s text-sand">
                {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="text-heading-s transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

export default ExhibitionHero;
