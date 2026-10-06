import { motion, useReducedMotion } from "framer-motion";
import interlude from "../../assets/images/hero/Riyoum4.jpg";

const ease = [0.76, 0, 0.24, 1] as const;

export default function CinematicInterlude() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-[90svh] min-h-[600px] overflow-hidden bg-ink text-ivory">
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

      <div className="absolute inset-0 bg-ink/10" />
      <div className="absolute inset-x-0 bottom-0 h-4/5 bg-linear-to-t from-ink/95 via-ink/65 to-transparent" />

      <div className="container relative z-10 flex h-full flex-col justify-between py-8 sm:py-10 lg:py-14">
        <p className="flex items-center gap-3 text-label font-medium tracking-[0.2em] text-ink">
          <span aria-hidden className="h-px w-8 bg-heritage-green" />
          JOS PLATEAU · NIGERIA
        </p>

        <motion.div
          className="max-w-4xl pb-2"
          initial={reduce ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <p className="mb-4 text-label font-medium tracking-[0.2em] text-sand sm:mb-5">
            THE MANY STORIES OF NIGERIA
          </p>

          <h2 className="font-display text-display-l leading-[0.92] text-ivory">
            <span className="block overflow-hidden pb-[0.12em]">
              <motion.span
                className="block"
                variants={{
                  hidden: { opacity: 0, y: "110%" },
                  show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
                }}
              >
                Too vast for
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
                <em className="font-normal not-italic">one story.</em>
              </motion.span>
            </span>
          </h2>

          <motion.p
            className="mt-5 max-w-xl text-body-l text-ivory/85 sm:mt-7"
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, delay: 0.48, ease },
              },
            }}
          >
            Look closer: every landscape, memory and voice opens a different
            way into Nigeria.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
