import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

import { getExhibitions } from "../../features/exhibitions/api/exhibitions";

export default function Exhibitions() {
  const reduce = useReducedMotion();

  const [exhibitions, setExhibitions] = useState<
    Awaited<ReturnType<typeof getExhibitions>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExhibitions() {
      try {
        const data = await getExhibitions();
        setExhibitions(data);
      } catch {
        setError("We couldn't load the exhibitions.");
      } finally {
        setLoading(false);
      }
    }

    loadExhibitions();
  }, []);

  return (
    <main className="bg-ivory text-ink">
      {/* Opening */}
      <section className="border-b border-line">
        <div className="container py-24 md:py-32 lg:py-40">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-5xl"
          >
            <p className="text-label font-medium tracking-[0.2em] text-ochre">
              EXPLORE EXHIBITIONS
            </p>

            <h1 className="mt-6 max-w-4xl font-display text-display-l leading-[0.92]">
              Stories worth stepping inside.
            </h1>

            <p className="mt-8 max-w-2xl text-body-l text-muted">
              Enter exhibitions that bring people, places, events, artifacts,
              and their connections into focus.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Exhibition collection */}
      <section className="py-20 md:py-28 lg:py-40">
        <div className="container">
          {loading && (
            <p className="text-body-m text-muted">
              Loading exhibitions...
            </p>
          )}

          {error && (
            <p className="text-body-m text-error">
              {error}
            </p>
          )}

          {!loading && !error && exhibitions.length === 0 && (
            <p className="text-body-m text-muted">
              No exhibitions are available yet.
            </p>
          )}

          {!loading && !error && exhibitions.length > 0 && (
            <div className="space-y-24 md:space-y-32 lg:space-y-40">
              {exhibitions.map((exhibition, index) => (
                <motion.article
                  key={exhibition.id}
                  initial={reduce ? false : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="grid gap-10 md:grid-cols-12 md:items-center md:gap-8 lg:gap-12"
                >
                  {/* Image */}
                  <div
                    className={[
                      "md:col-span-7",
                      index % 2 !== 0 ? "md:order-2" : "",
                    ].join(" ")}
                  >
                    <Link
                      to={`/exhibitions/${exhibition.slug}`}
                      aria-label={`View exhibition: ${exhibition.title}`}
                      className="group block"
                    >
                      <div className="aspect-[3/2] overflow-hidden bg-sand">
                        {exhibition.cover_image_url ? (
                          <img
                            src={exhibition.cover_image_url}
                            alt={exhibition.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="relative flex h-full flex-col justify-between overflow-hidden bg-deep-forest p-8 text-ivory md:p-12">
                            <div
                              aria-hidden="true"
                              className="absolute -right-16 -top-24 size-72 rounded-full border border-ivory/15 md:size-96"
                            />
                            <div
                              aria-hidden="true"
                              className="absolute -right-5 -top-12 size-52 rounded-full border border-ivory/10 md:size-72"
                            />

                            <p className="relative text-label font-medium tracking-[0.2em] text-sand">
                              REKÒ EXHIBITION
                            </p>

                            <div className="relative max-w-xl">
                              <h3 className="font-display text-display-m leading-[0.95]">
                                {exhibition.title}
                              </h3>

                              {(exhibition.start_date || exhibition.end_date) && (
                                <p className="mt-5 text-meta tracking-[0.12em] text-ivory/65">
                                  {exhibition.start_date &&
                                    formatYear(exhibition.start_date)}
                                  {exhibition.start_date &&
                                    exhibition.end_date &&
                                    " — "}
                                  {exhibition.end_date &&
                                    formatYear(exhibition.end_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Information */}
                  <div
                    className={[
                      "md:col-span-5",
                      index % 2 !== 0
                        ? "md:order-1 md:pl-8 lg:pl-16"
                        : "md:pr-8 lg:pr-16",
                    ].join(" ")}
                  >
                    {exhibition.start_date && (
                      <p className="text-meta tracking-[0.12em] text-ochre">
                        {formatYear(exhibition.start_date)}
                        {exhibition.end_date &&
                          ` — ${formatYear(exhibition.end_date)}`}
                      </p>
                    )}

                    <h2 className="mt-4 font-display text-display-m leading-[0.92]">
                      {exhibition.title}
                    </h2>

                    {exhibition.subtitle && (
                      <p className="mt-4 font-display text-heading-s text-deep-forest">
                        {exhibition.subtitle}
                      </p>
                    )}

                    {exhibition.description && (
                      <p className="mt-6 max-w-lg text-body-m text-muted">
                        {exhibition.description}
                      </p>
                    )}

                    <Link
                      to={`/exhibitions/${exhibition.slug}`}
                      className="mt-8 inline-flex items-center gap-3 text-body-m text-heritage-green transition-transform duration-300 hover:translate-x-1"
                    >
                      Enter exhibition
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatYear(date: string) {
  return new Date(date).getFullYear();
}