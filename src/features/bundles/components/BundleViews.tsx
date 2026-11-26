import { Link } from "react-router-dom";
import ArrowLink from "../../../components/ui/ArrowLink";
import { bundleCoverUrl } from "../helpers";
import type { Bundle } from "../types";

// One exhibition as a single picture tile. It opens that exhibition's items.
export function ExhibitionTile({
  bundle,
  basePath,
  noun,
}: {
  bundle: Bundle;
  basePath: string;
  noun: string;
}) {
  const cover = bundleCoverUrl(bundle);

  return (
    <Link
      to={`${basePath}?exhibition=${encodeURIComponent(bundle.slug)}`}
      className="group relative block aspect-4/5 overflow-hidden bg-deep-forest text-ivory"
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-display text-display-m text-ivory/20"
        >
          {bundle.title.charAt(0)}
        </span>
      )}
      <span
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/20 to-transparent"
      />
      <span className="absolute inset-x-0 bottom-0 p-5">
        <span className="block font-display text-heading-s leading-tight">
          {bundle.title}
        </span>
        <span className="mt-1 block text-meta text-ivory/80">
          {bundle.items.length} {noun}
        </span>
      </span>
    </Link>
  );
}

// The top of one exhibition's page of items.
export function ExhibitionHeader({
  bundle,
  count,
  basePath,
  noun,
  allLabel,
}: {
  bundle: Bundle;
  count: number;
  basePath: string;
  noun: string;
  allLabel: string;
}) {
  return (
    <div className="mt-10 border-t-2 border-ochre bg-sand/30 p-6 md:p-8">
      <Link to={basePath} className="text-body-s text-muted hover:text-ink">
        <span aria-hidden>←</span> {allLabel}
      </Link>
      <p className="mt-6 text-label font-medium uppercase tracking-[0.2em] text-ochre-deep">
        From the exhibition
      </p>
      <h2 className="mt-2 font-display text-heading-l leading-tight">
        {bundle.title}
      </h2>
      {bundle.subtitle && (
        <p className="mt-3 max-w-2xl font-sans text-body-m text-muted">
          {bundle.subtitle}
        </p>
      )}
      <p className="mt-4 text-body-s text-muted">
        {count} {noun}
      </p>
      <ArrowLink
        to={`/exhibitions/${bundle.slug}`}
        className="mt-6 text-heritage-green"
      >
        Open the exhibition
      </ArrowLink>
    </div>
  );
}