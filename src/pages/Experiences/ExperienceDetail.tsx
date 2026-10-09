import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";

import ExperienceNav from "../../features/experience/components/ExperienceNav";
import ExperienceGuide from "../../features/experience/components/ExperienceGuide";
import CinematicImage from "../../features/experience/components/CinematicImage";
import ChapterContent from "../../features/experience/components/ChapterContent";
import ChapterFooter from "../../features/experience/components/ChapterFooter";
import ExperienceEnding from "../../features/experience/components/ExperienceEnding";
import { getExperienceBySlug } from "../../features/experience/api";
import type { Experience } from "../../features/experience/types";
import { useChapterDate } from "../../features/experience/useChapterDate";
import { useProgressSaver } from "../../features/progress/useProgressSaver";
import NotesWidget from "../../features/notes/noteWidget";
import SignupGate from "../../features/exhibitions/components/SignupGate";
import { useAuth } from "../../features/auth/auth-context";
import { ApiError } from "../../services/api/client";

// Only used when a chapter and its exhibition both have no image set.
import fallbackImage from "../../assets/hero.png";

function ExperienceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user || !slug) return;

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
      } catch (caught) {
        if (caught instanceof ApiError && caught.status === 401) {
          setError(caught.code === "SIGNUP_REQUIRED" ? "SIGNUP_REQUIRED" : "SIGNIN_REQUIRED");
        } else {
          setError("Unable to load this experience.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadExperience();
  }, [slug, user, authLoading]);

  // The current chapter lives in the URL (?chapter=<section slug>) so a
  // chapter can be linked to and survives a refresh. Unknown or missing
  // values open the first chapter.
  const sections = experience?.sections ?? [];
  const chapterSlug = searchParams.get("chapter");
  const chapterIndex = Math.max(
    0,
    sections.findIndex((item) => item.slug === chapterSlug),
  );

  // Remember where a signed-in visitor is. This does nothing for visitors
  // who aren't signed in, and while the experience is still loading.
  useProgressSaver(
    experience?.id,
    sections[chapterIndex]?.id,
    sections.length > 0 && chapterIndex === sections.length - 1,
  );

  // The big date comes from this chapter's own events.
  const date = useChapterDate(sections[chapterIndex]?.id);

  if (loading) {
    if (!authLoading && !user) {
      return (
        <SignupGate
          returnTo={location.pathname + location.search}
          mode="signup"
        />
      );
    }
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink text-white">
        <p className="font-sans text-sm text-white/60">Loading experience...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <SignupGate
        returnTo={location.pathname + location.search}
        mode="signup"
      />
    );
  }

  if (error === "SIGNUP_REQUIRED" || error === "SIGNIN_REQUIRED") {
    return (
      <SignupGate
        returnTo={location.pathname + location.search}
        mode={error === "SIGNUP_REQUIRED" ? "signup" : "signin"}
      />
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

  if (sections.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-5 text-white">
        <p className="font-sans text-sm text-white/60">
          This experience has no chapters yet.
        </p>
      </main>
    );
  }

  const section = sections[chapterIndex];
  const nextSection = sections[chapterIndex + 1]; // undefined on the last chapter

  // The chapter's own image, then the exhibition's cover, then a plain default.
  const image =
    section.hero_image_url || experience.cover_image_url || fallbackImage;

  const goToChapter = (index: number) => {
    setSearchParams({ chapter: sections[index].slug }, { replace: true });
  };

  return (
    <main className="bg-ink text-white">
      <ExperienceNav title={experience.title} />
      <ExperienceGuide />
      <NotesWidget />

      {/* When one chapter has faded out, jump to the top for the next one */}
      <AnimatePresence
        mode="wait"
        onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}
      >
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
                {date && (
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-[clamp(5rem,min(15vw,24svh),13rem)] leading-[0.85] tracking-[-0.05em] text-ivory/90"
                  >
                    {date}
                  </motion.p>
                )}

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

          <ChapterContent section={section} date={date ?? ""} />

          {nextSection ? (
            <ChapterFooter
              chapterNumber={chapterIndex + 1}
              nextTitle={nextSection.title}
              onNext={() => goToChapter(chapterIndex + 1)}
            />
          ) : (
            <ExperienceEnding
              experienceTitle={experience.title}
              onRestart={() => goToChapter(0)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

export default ExperienceDetail;
