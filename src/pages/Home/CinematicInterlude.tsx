import { motion, useReducedMotion } from "framer-motion";
import interlude from "../../assets/images/hero/Riyoum.jpg";

const ease = [0.76, 0, 0.24, 1] as const;

export default function CinematicInterlude() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-[90svh] min-h-[560px] overflow-hidden bg-ink">
      <motion.img
        src={interlude}
        alt="Rock formations across the Jos Plateau in Nigeria"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[50%_45%]"
        initial={reduce ? false : { scale: 1.06 }}
        whileInView={reduce ? undefined : { scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2.4, ease }}
      />

      {/* Darkness only where the text sits */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-ink/75 to-transparent" />

      <div className="container relative z-10 flex h-full items-end pb-12 lg:pb-24">
        {/* Each line rises from its own mask */}
        <motion.div
          className="font-display text-display-l leading-[1] text-ivory"
          initial={reduce ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2>
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span
                className="block"
                variants={{
                  hidden: { opacity: 0, y: "110%" },
                  show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
                }}
              >
                Nigeria is not
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span
                className="block"
                variants={{
                  hidden: { opacity: 0, y: "110%" },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1, delay: 0.22, ease },
                  },
                }}
              >
                one story.
              </motion.span>
            </span>
          </h2>
        </motion.div>
      </div>
    </section>
  );
}
