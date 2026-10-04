import { useEffect, useState } from "react";
import ArrowLink from "../../components/ui/ArrowLink";
import { getExhibitions } from "../../services/api/exhibitions";
import aburiImage from "../../assets/images/hero/aburi.jpg";

export default function FeaturedExhibition() {
  const [slug, setSlug] = useState<string | null>(null);

  // The backend has no "featured" flag, so find the Aburi exhibition by title
  useEffect(() => {
    getExhibitions()
      .then((list) => {
        const aburi = list.find((e) => e.title.toLowerCase().includes("aburi"));
        setSlug(aburi?.slug ?? null);
      })
      .catch(() => setSlug(null));
  }, []);

  const href = slug ? `/exhibitions/${slug}` : "/explore/exhibitions";

  return (
    <section className="bg-ivory pb-24 lg:pb-40">
      <div className="container">
        <div className="border-t border-line" />

        <p className="mt-12 text-label font-medium tracking-widest text-heritage-green lg:mt-16">
          FEATURED EXHIBITION
        </p>

        <div className="relative mt-8 lg:mt-12">
          <div className="aspect-4/3 w-full overflow-hidden bg-sand lg:aspect-16/10 lg:w-2/3">
            <img
              src={aburiImage}
              alt="Yakubu Gowon shaking hands with Odumegwu Ojukwu, surrounded by delegates and officers, at the Aburi talks in Ghana, January 1967"
              className="h-full w-full object-cover object-[50%_30%]"
            />
          </div>

          <p className="mt-3 text-meta text-muted lg:absolute lg:left-0 lg:top-full lg:w-1/2">
            Yakubu Gowon (left) shaking hands with Odumegwu Ojukwu (right),
            surrounded by delegates and officers. Aburi, Ghana, January 1967.
            Source: thehistoryville.com.
          </p>

          <h2 className="mt-8 font-display text-display-l leading-[0.95] tracking-normal text-ink lg:absolute lg:bottom-0 lg:left-[56%] lg:mt-0 lg:text-ivory lg:mix-blend-difference">
            <span className="block">
              THE<span className="lg:block"> ABURI</span>
            </span>
            <span className="block">ACCORD</span>
          </h2>
        </div>

        <div className="mt-8 lg:ml-[56%] lg:mt-10 lg:max-w-md">
          <p className="text-body-l text-muted">
            A meeting that promised a different path for Nigeria — and became a
            turning point in the country's history.
          </p>

          <ArrowLink to={href} className="mt-8">
            Enter exhibition
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
