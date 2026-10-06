import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "Exhibitions", to: "/explore/exhibitions" },
  { label: "People", to: "/explore/people" },
  { label: "Events", to: "/explore/events" },
  { label: "Places", to: "/explore/places" },
  { label: "Artifacts", to: "/explore/artifacts" },
];

const rekoLinks = [
  { label: "Stories", to: "/stories" },
  { label: "About", to: "/about" },
  { label: "Sources / Methodology", to: "/sources" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

export default function Footer() {
  const reduce = useReducedMotion();

  return (
    <footer className="overflow-hidden bg-deep-forest text-ivory">
      <div className="container">
        {/* Main footer */}
        <div className="grid gap-16 py-20 md:grid-cols-12 md:gap-8 lg:py-24">
          {/* Brand */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="md:col-span-6 lg:col-span-7"
          >
            <Link
              to="/"
              className="font-display text-heading-l tracking-[-0.04em]"
            >
              REKÒ
            </Link>

            <p className="mt-4 max-w-sm text-body-m text-ivory/65">
              Know Your Roots. Own Your Future.
            </p>

            <p className="mt-8 max-w-md text-body-s leading-relaxed text-ivory/50">
              Exploring Nigeria's history, culture, and the stories shaping
              its present.
            </p>
          </motion.div>

          {/* Explore */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="md:col-span-3 lg:col-span-2"
          >
            <p className="text-label font-medium tracking-[0.18em] text-sand">
              EXPLORE
            </p>

            <nav className="mt-6 flex flex-col items-start gap-3">
              {exploreLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-body-s text-ivory/70 transition-colors hover:text-ivory"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* REKÒ */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-3 lg:col-span-3"
          >
            <p className="text-label font-medium tracking-[0.18em] text-sand">
              REKÒ
            </p>

            <nav className="mt-6 flex flex-col items-start gap-3">
              {rekoLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-body-s text-ivory/70 transition-colors hover:text-ivory"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-line-light py-6">
          <div className="flex flex-col gap-2 text-meta text-ivory/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 REKÒ</p>
            <p>Nigeria's history, culture, and stories.</p>
          </div>
        </div>
      </div>

      {/* Large wordmark */}
      <div
        aria-hidden="true"
        className="select-none overflow-hidden px-[3vw] pt-8"
      >
        <motion.div
          initial={reduce ? false : { y: "20%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 1.2,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="text-center font-display text-[clamp(8rem,25vw,24rem)] leading-[0.7] tracking-[-0.07em] text-ivory/10"
        >
          REKÒ
        </motion.div>
      </div>
    </footer>
  );
}