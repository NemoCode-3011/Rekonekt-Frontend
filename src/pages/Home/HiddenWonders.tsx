import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ArrowLink from "../../components/ui/ArrowLink";
import awhum from "../../assets/images/hero/Awhuhm.png";
import idanre from "../../assets/images/hero/Idanre-Hill.jpg";
import agbokim from "../../assets/images/hero/Agbokim.jpg";

type Wonder = {
  name: string;
  location: string;
  image: string;
  href: string;
};

const wonders: Wonder[] = [
  {
    name: "Awhum Waterfall",
    location: "Enugu State",
    image: awhum,
    href: "/places/awhum-waterfall",
  },
  {
    name: "Idanre Hills",
    location: "Ondo State",
    image: idanre,
    href: "/places/idanre-hills",
  },
  {
    name: "Agbokim Waterfalls",
    location: "Cross River State",
    image: agbokim,
    href: "/places/agbokim-waterfalls",
  },
];

const INTERVAL = 6000;

export default function HiddenWonders() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % wonders.length);
    }, INTERVAL);

    return () => window.clearInterval(timer);
  }, [reduce]);

  const wonder = wonders[active];

  return (
    <section className="relative min-h-[90svh] overflow-hidden bg-ink text-ivory lg:min-h-screen">
      <AnimatePresence mode="sync">
        <motion.div
          key={wonder.image}
          initial={reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={wonder.image}
            alt={`${wonder.name}, ${wonder.location}`}
            className="h-full w-full object-cover"
            initial={reduce ? { scale: 1 } : { scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 6,
              ease: "linear",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-ink/10" />

      <div className="container relative flex min-h-[90svh] flex-col justify-end py-16 lg:min-h-screen lg:py-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: -16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-sand">
              HIDDEN WONDERS OF NIGERIA
            </p>

            <h2 className="mt-5 max-w-3xl font-display text-display-l leading-[0.95]">
              Some of Nigeria's stories are hiding in plain sight.
            </h2>

            <div className="mt-10">
              <p className="font-display text-heading-m leading-none">
                {wonder.name}
              </p>

              <p className="mt-2 text-meta uppercase tracking-widest text-sand">
                {wonder.location}
              </p>
            </div>

            <ArrowLink
              to={wonder.href}
              className="mt-8 text-ivory"
            >
              Discover the wonder
            </ArrowLink>
          </motion.div>
        </AnimatePresence>

        {/* Wonder navigation */}
        <div className="mt-12 flex items-center gap-3">
          {wonders.map((item, index) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${item.name}`}
              aria-current={active === index ? "true" : undefined}
              className="group flex items-center gap-2 py-2"
            >
              <span
                className={[
                  "h-px transition-all duration-500",
                  active === index
                    ? "w-12 bg-ivory"
                    : "w-6 bg-ivory/40 group-hover:bg-ivory/70",
                ].join(" ")}
              />
            </button>
          ))}

          <span className="ml-2 text-meta tracking-widest text-ivory/70">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(wonders.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}