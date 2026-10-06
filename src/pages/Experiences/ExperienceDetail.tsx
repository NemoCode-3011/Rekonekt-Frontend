import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import ExperienceNav from "../../features/experience/components/ExperienceNav";
import CinematicImage from "../../features/experience/components/CinematicImage";
import ChapterContent from "../../features/experience/components/ChapterContent";
import { getExperienceBySlug } from "../../features/experience/api";
import type { Experience } from "../../features/experience/types";

import aburi from "../../assets/images/hero/aburi.jpg";
import aburi2 from "../../assets/images/hero/aburi2.jpg";

const chapterImages = [aburi, aburi2, aburi, aburi2, aburi, aburi2, aburi];

const chapterDates = [
  "1967",
  "1966",
  "JANUARY 1967",
  "JANUARY 4–5, 1967",
  "1967",
  "MAY 1967",
  "1967 →",
];

function ExperienceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Experience not found.");
      setLoading(false);
      return;
    }

    const experienceSlug = slug;

    async function loadExperience() {
      try {
        setLoading(true);
        setError(null);

        const data = await getExperienceBySlug(experienceSlug);

        setExperience({
          ...data,
          sections: [...data.sections].sort(
            (a, b) => a.section_order - b.section_order,
          ),
        });
      } catch {
        setError("Unable to load this experience.");
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, [slug]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-white">
        <p className="font-sans text-sm text-white/60">Loading experience...</p>
      </main>
    );
  }

  if (error || !experience) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-white">
        <p className="font-sans text-sm text-white/60">
          {error ?? "Experience not found."}
        </p>
      </main>
    );
  }

  const { sections } = experience;

  if (sections.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-white">
        <p className="font-sans text-sm text-white/60">
          This experience has no chapters yet.
        </p>
      </main>
    );
  }

  // The current chapter lives in the URL (?chapter=<section slug>) so a
  // chapter can be linked to and survives a refresh. Unknown or missing
  // values open the first chapter.
  const chapterSlug = searchParams.get("chapter");
  const chapterIndex = Math.max(
    0,
    sections.findIndex((item) => item.slug === chapterSlug),
  );

  const section = sections[chapterIndex];
  const image = chapterImages[chapterIndex] ?? aburi;
  const date = chapterDates[chapterIndex] ?? "1967";

  const goToChapter = (index: number) => {
    setSearchParams({ chapter: sections[index].slug }, { replace: true });
  };

  return (
    <main className="bg-ink text-white">
      <ExperienceNav title={experience.title} />

      <AnimatePresence mode="wait">
        <motion.div
          key={section.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <section className="relative flex min-h-screen items-end overflow-hidden">
            <CinematicImage
              src={image}
              alt={`${experience.title} — ${section.title}`}
              focus="50% 30%"
            />

            <div className="relative z-10 w-full px-5 pb-20 pt-32 md:px-10 md:pb-24">
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.15,
                  ease: "easeOut",
                }}
                className="max-w-7xl"
              >
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="font-display text-[clamp(5rem,min(15vw,24svh),13rem)] leading-[0.85] tracking-[-0.05em] text-ivory/90"
                >
                  {date}
                </motion.p>

                <p className="mt-5 font-sans text-label uppercase tracking-[0.18em] text-ivory/75">
                  Chapter {String(chapterIndex + 1).padStart(2, "0")}
                </p>

                <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.03em] text-ivory">
                  {section.title}
                </h1>

                <div className="mt-12 flex items-center gap-3">
                  {sections.map((chapter, index) => (
                    <button
                      key={chapter.id}
                      type="button"
                      aria-label={`Go to ${chapter.title}`}
                      aria-current={index === chapterIndex ? "step" : undefined}
                      onClick={() => goToChapter(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === chapterIndex
                          ? "w-12 bg-white"
                          : "w-5 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <ChapterContent
            section={section}
            chapterNumber={chapterIndex + 1}
            date={date}
          />
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default ExperienceDetail;
