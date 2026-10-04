import { useRef } from "react";

import benin from "../../assets/images/hero/benin1.jpg";
import fela from "../../assets/images/hero/fela3.jpg";
// import lagos from "../../assets/images/exhibitions/lagos.jpg";

type Upcoming = {
  title: string;
  image: string;
};

const upcoming: Upcoming[] = [
  {
    title: "The Benin Kingdom",
    image: benin,
  },
  {
    title: "Fela & the Politics of Music",
    image: fela,
  },
  // {
  //   title: "Lagos: A City in Motion",
  //   image: lagos,
  // },
];

export default function ComingSoon() {
  const railRef = useRef<HTMLUListElement>(null);

  function scrollRail(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;

    const card = rail.querySelector("li");
    const step = (card?.clientWidth ?? 320) + 24;

    rail.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  }

  return (
    <section className="bg-deep-forest py-24 text-ivory lg:py-40">
      <div className="container">
        <div className="flex items-end justify-between">
          <p className="text-label font-medium tracking-widest text-sand">
            COMING SOON
          </p>

          <div className="hidden gap-3 md:flex">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Previous"
              className="size-11 rounded-full border border-line-light transition-colors duration-300 hover:bg-ivory/10"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Next"
              className="size-11 rounded-full border border-line-light transition-colors duration-300 hover:bg-ivory/10"
            >
              →
            </button>
          </div>
        </div>
      </div>

      <ul
        ref={railRef}
        className="
          mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto
          pb-2 motion-safe:scroll-smooth
          pl-[var(--gutter-mobile)]
          pr-[var(--gutter-mobile)]
          scroll-pl-[var(--gutter-mobile)]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden

          md:pl-[var(--gutter-tablet)]
          md:pr-[var(--gutter-tablet)]
          md:scroll-pl-[var(--gutter-tablet)]

          lg:mt-14 lg:gap-6
          lg:pl-[max(var(--gutter-desktop),calc((100vw-1440px)/2))]
          lg:pr-[max(var(--gutter-desktop),calc((100vw-1440px)/2))]
          lg:scroll-pl-[max(var(--gutter-desktop),calc((100vw-1440px)/2))]
        "
      >
        {upcoming.map((item) => (
          <li
            key={item.title}
            className="
              w-[72vw] shrink-0 snap-start
              sm:w-[44vw]
              lg:w-[34vw] lg:max-w-[520px]
            "
          >
            <article className="group relative aspect-3/4 w-full overflow-hidden bg-ink">
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="
                  h-full w-full object-cover
                  transition-transform duration-700
                  group-hover:scale-[1.03]
                "
              />

              <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
                <h3 className="max-w-[90%] font-display text-heading-m leading-[1.05]">
                  {item.title}
                </h3>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}