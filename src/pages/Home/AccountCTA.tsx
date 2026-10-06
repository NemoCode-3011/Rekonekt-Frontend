import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import ArrowLink from "../../components/ui/ArrowLink";

export default function AccountCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-heritage-green text-ivory">
      <div className="container py-24 md:py-32 lg:py-40">
        <div className="max-w-5xl">
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6 }}
            className="text-label font-medium tracking-[0.2em] text-ivory/70"
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
              Don't just explore history. Keep it with you.
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
            className="mt-8 max-w-2xl text-body-l text-ivory/80"
          >
            Save the stories that stay with you. Track your progress.
            Build your own path through REKÒ.
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
            <ArrowLink to="/auth/signup" className="text-ivory">
              Create your account
            </ArrowLink>

            <Link
              to="/auth/login"
              className="text-body-m text-ivory/70 transition-colors hover:text-ivory"
            >
              Already have an account? Sign in
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}