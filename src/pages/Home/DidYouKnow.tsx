import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";
import { getDidYouKnowStory, storyPath } from "../../features/stories/api";
import { categoryLabel } from "../../features/stories/Category";
import type { DidYouKnowStory } from "../../features/stories/types";

// The story of the day, taken from the stories on the Stories page. Its snippet
// ("did you know") is the headline, its picture is the image, and the link opens
// that exact story. If there is no story ready, this section does not appear.
export default function DidYouKnow() {
  const reduce = useReducedMotion();
  const [story, setStory] = useState<DidYouKnowStory | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDidYouKnowStory()
      .then((result) => {
        if (!cancelled) setStory(result);
      })
      .catch(() => {
        // The home page works without this section, so a failure is not shown.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!story) return null;

  const label = categoryLabel(story.category);
  // A long snippet gets a smaller headline so it doesn't fill the whole screen.
  const headingSize =
    story.did_you_know.length > 110
      ? "text-heading-s lg:text-heading-m"
      : "text-heading-m lg:text-heading-l";

  return (
    <section className="bg-ivory py-20 text-ink md:py-28 lg:py-40">
      <div className="container">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-label font-medium tracking-[0.2em] text-ochre md:mb-16"
        >
          DID YOU KNOW?
        </motion.p>

        <div className="grid items-center gap-12 md:grid-cols-12 md:gap-8 lg:gap-16">
          {/* Image */}
          <motion.div
            initial={reduce ? false : { x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-5"
          >
            <div className="aspect-4/5 overflow-hidden bg-sand/40">
              <img
                src={story.cover_image_url}
                alt={story.cover_image_alt ?? ""}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            {story.cover_image_credit && (
              <p className="mt-3 text-label text-muted">
                {story.cover_image_credit}
              </p>
            )}
          </motion.div>

          {/* Content */}
          <div className="md:col-span-7 lg:pl-4">
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`max-w-3xl font-display leading-[1.05] ${headingSize}`}
            >
              {story.did_you_know}
            </motion.h2>

            {/* Underline */}
            <div className="mt-8 h-px w-full max-w-sm">
              <motion.div
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.8,
                  delay: 0.25,
                  ease: [0.76, 0, 0.24, 1],
                }}
                style={{ transformOrigin: "left" }}
                className="h-px w-24 bg-ochre"
              />
            </div>

            {/* Which story this comes from */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 max-w-2xl text-body-l text-muted"
            >
              {label ? `${label} · ` : ""}
              {story.title}
            </motion.p>

            {/* Link: opens this exact story */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10"
            >
              <ArrowLink to={storyPath(story.slug)} className="text-ink">
                Explore the story
              </ArrowLink>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
