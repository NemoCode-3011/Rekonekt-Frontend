// Visual compositions for the Discover Differently stages.

export function PeopleStage() {
  return (
    <div className="flex h-full items-center justify-center gap-10 p-6 md:p-10">
      {/* Portrait slot: the real portrait goes here (object-cover, grayscale) */}
      <div className="aspect-3/4 h-full shrink-0 border border-ink/25 bg-ink/10" />

      <div className="hidden w-40 space-y-4 md:block">
        <div className="h-px bg-ink/40" />
        <div className="h-2.5 w-3/4 bg-ink/15" />
        <div className="h-2 w-1/2 bg-ink/10" />
      </div>
    </div>
  );
}

export function EventsStage() {
  return (
    <div className="flex h-full flex-col justify-between p-6 md:p-10">
      {/* Year slot: the real event year replaces 0000 */}
      <p
        aria-hidden
        className="font-display text-[clamp(6rem,22vw,18rem)] leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(245,240,230,0.55)]"
      >
        0000
      </p>

      <div aria-hidden className="relative">
        <div className="flex items-end justify-between">
          {Array.from({ length: 31 }).map((_, i) => (
            <span
              key={i}
              className={`w-px bg-ivory/40 ${i % 5 === 0 ? "h-4" : "h-2"}`}
            />
          ))}
        </div>
        <div className="h-px bg-ivory/40" />
        <span className="absolute -bottom-[5px] left-[62%] size-2.5 rounded-full bg-ivory" />
      </div>
    </div>
  );
}

export function PlacesStage() {
  return (
    <div className="h-full p-6 md:p-10">
      {/* Landscape slot: the real place photograph goes here */}
      <div className="relative h-full w-full border border-ivory/30 bg-ink/15">
        <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/20" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-ivory/20" />
        {/* Coordinate slots: latitude and longitude of the real place */}
        <span className="absolute left-4 top-4 text-meta tracking-widest text-ivory/70">
          00.0000° N
        </span>
        <span className="absolute bottom-4 right-4 text-meta tracking-widest text-ivory/70">
          00.0000° E
        </span>
      </div>
    </div>
  );
}

export function ArtifactsStage() {
  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center p-6 md:flex-[7] md:p-10">
        {/* Object slot: one isolated object on a plain ground */}
        <div className="aspect-square h-full max-h-72 rounded-full bg-sand/45 md:max-h-80" />
      </div>

      {/* Catalog metadata slots */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-6 pt-0 md:flex md:flex-[5] md:flex-col md:justify-center md:gap-5 md:p-10">
        {["Type", "Date", "Place", "Source"].map((label) => (
          <div key={label} className="border-t border-ink/25 pt-3">
            <dt className="text-label font-medium uppercase tracking-widest text-muted">
              {label}
            </dt>
            <dd className="mt-3 h-2 w-2/3 bg-ink/10" />
          </div>
        ))}
      </dl>
    </div>
  );
}