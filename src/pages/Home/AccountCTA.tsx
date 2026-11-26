import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AccountCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-sand/50 text-ink">
      <div className="container py-24 md:py-32 lg:py-40">
        <div className="max-w-5xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-label font-medium tracking-[0.2em] text-heritage-green"
          >
            MAKE IT YOURS
          </motion.p>

          <div className="mt-6 overflow-hidden">
            <motion.h2
              initial={reduce ? false : { y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-4xl font-display text-display-m leading-[0.95] lg:text-display-l"
            >
              Keep the stories that stay with you.
            </motion.h2>
          </div>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="mt-8 max-w-2xl text-body-l text-ink/75"
          >
            Save the people, places and stories that matter to you. Keep notes, track
            your progress and return whenever you're ready.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
            }}
            className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8"
          >
            <Link
              to="/auth/signup"
              className="group inline-flex h-12 items-center gap-4 rounded-full bg-heritage-green pl-7 pr-1.5 text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
            >
              Create your account
              <span className="grid size-9 place-items-center rounded-full bg-ochre-light text-deep-forest transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </Link>

            <Link
              to="/auth/login"
              className="text-body-m text-ink/75 transition-colors hover:text-ink"
            >
              Already have an account? Sign in
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
