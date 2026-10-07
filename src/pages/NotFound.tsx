import ArrowLink from "../components/ui/ArrowLink";

export default function NotFound() {
  return (
    <div className="bg-ivory text-ink">
      <div className="container py-28 md:py-40">
        <p
          aria-hidden
          className="font-display text-display-xl leading-none text-ochre"
        >
          404
        </p>

        <h1 className="mt-6 max-w-2xl font-display text-heading-l leading-tight">
          This page isn't in the collection.
        </h1>

        <p className="mt-6 max-w-lg text-body-l text-muted">
          It may have moved, or the link may be wrong. Let's get you back to
          something worth exploring.
        </p>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          <ArrowLink to="/explore">Explore REKÒ</ArrowLink>
          <ArrowLink to="/">Go home</ArrowLink>
        </div>
      </div>
    </div>
  );
}
