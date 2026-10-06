import { motion, useReducedMotion } from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";

import discoveryImage from "../../assets/images/hero/fela3.jpg";

type DiscoveryStory = {
  title: string;
  excerpt: string;
  image: string;
  href: string;
};

const discoveryStory: DiscoveryStory = {
  // Temporary content.
  // Replace with GET /stories/discovery when the backend is ready.
  title: "Nigeria's history is full of stories worth finding.",
  excerpt:
    "The past becomes more interesting when you look beyond the familiar names and events and start following the connections between them.",
  image: discoveryImage,
  href: "/stories",
};

export default function DidYouKnow() {
  const reduce = useReducedMotion();

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
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="md:col-span-5"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={discoveryStory.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <div className="md:col-span-7 lg:pl-4">
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-3xl font-display text-display-m leading-[0.95] lg:text-display-l"
            >
              {discoveryStory.title}
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

            {/* Context */}
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.7,
                delay: 0.15,
              }}
              className="mt-8 max-w-2xl text-body-l text-muted"
            >
              {discoveryStory.excerpt}
            </motion.p>

            {/* Link */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
              }}
              className="mt-10"
            >
              <ArrowLink
                to={discoveryStory.href}
                className="text-ink"
              >
                Explore the story
              </ArrowLink>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}