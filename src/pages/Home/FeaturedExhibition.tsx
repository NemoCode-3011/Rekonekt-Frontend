import { useEffect, useState } from "react";
import ArrowLink from "../../components/ui/ArrowLink";
import { getExhibitions } from "../../features/exhibitions/api/exhibitions";
import type { Exhibition } from "../../features/exhibitions/types/exhibitions";
import fallbackImage from "../../assets/images/hero/benin1.jpg";

// The exhibition shown on the homepage
const FEATURED_SLUG = "the-benin-empire";

export default function FeaturedExhibition() {
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);

  useEffect(() => {
    getExhibitions()
      .then((list) => {
        setExhibition(
          list.find((item) => item.slug === FEATURED_SLUG) ?? list[0] ?? null,
        );
      })
      .catch(() => setExhibition(null));
  }, []);

  const title = exhibition?.title ?? "Our exhibitions";
  const teaser =
    exhibition?.subtitle ??
    "Stories that unfold across time, place and perspective.";
  const image = exhibition?.cover_image_url || fallbackImage;
  const href = exhibition
    ? `/exhibitions/${exhibition.slug}`
    : "/explore/exhibitions";

  return (
    <section className="bg-sand/25 pb-24 lg:pb-40">
      <div className="container">
        <div className="border-t border-line" />

        <p className="mt-12 text-label font-medium tracking-widest text-heritage-green lg:mt-16">
          FEATURED EXHIBITION
        </p>

        <div className="relative mt-8 lg:mt-12">
          <div className="relative aspect-4/3 w-full overflow-hidden bg-[#090b09] lg:aspect-16/10 lg:w-2/3">
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,199,143,0.32)_0%,rgba(15,19,15,0.12)_42%,rgba(0,0,0,0.78)_100%)]"
            />
            <img
              src={image}
              alt={title}
              className="relative z-10 h-full w-full object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.55)]"
            />
          </div>

          <h2 className="mt-8 font-display text-display-l uppercase leading-[0.95] tracking-normal text-ink lg:absolute lg:bottom-0 lg:left-[56%] lg:mt-0 lg:text-ivory lg:mix-blend-difference">
            {title}
          </h2>
        </div>

        <div className="mt-8 lg:ml-[56%] lg:mt-10 lg:max-w-md">
          <p className="text-body-l text-muted">{teaser}</p>

          <ArrowLink to={href} className="mt-8">
            Enter exhibition
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
