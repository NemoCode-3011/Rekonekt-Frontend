
import type { DiscoverSample } from "../../features/home/useDiscoverSamples";

interface StageProps {
  sample?: DiscoverSample | null;
}

export function PeopleStage({ sample }: StageProps) {
  return (
    <div className="flex h-full items-center justify-center gap-10 p-6 md:p-10">
      <div className="aspect-3/4 h-full shrink-0 overflow-hidden border border-ink/25 bg-ink/10">
        {sample?.image && (
          <img
            src={sample.image}
            alt={sample.title}
            className="h-full w-full object-cover grayscale"
          />
        )}
      </div>

      <div className="hidden w-40 space-y-4 md:block">
        <div className="h-px bg-ink/40" />

        {sample ? (
          <>
            <p className="font-display text-heading-s leading-tight">
              {sample.title}
            </p>
            {sample.meta && (
              <p className="text-meta text-ink/70">{sample.meta}</p>
            )}
          </>
        ) : (
          <>
            <div className="h-2.5 w-3/4 bg-ink/15" />
            <div className="h-2 w-1/2 bg-ink/10" />
          </>
        )}
      </div>
    </div>
  );
}

export function EventsStage({ sample }: StageProps) {
  return (
    <div className="flex h-full flex-col justify-between p-6 md:p-10">
      <p
        aria-hidden
        className="font-display text-[clamp(6rem,22vw,18rem)] leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(245,240,230,0.55)]"
      >
        {sample?.year ?? "0000"}
      </p>

      <div>
        {sample && (
          <p className="mb-6 max-w-md font-display text-heading-s leading-tight">
            {sample.title}
          </p>
        )}

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
    </div>
  );
}

export function PlacesStage({ sample }: StageProps) {
  return (
    <div className="h-full p-6 md:p-10">
      <div className="relative h-full w-full overflow-hidden border border-ivory/30 bg-ink/15">
        {sample?.image && (
          <img
            src={sample.image}
            alt={sample.title}
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        )}

        <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/20" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-ivory/20" />

        <span className="absolute left-4 top-4 text-meta tracking-widest text-ivory/80">
          {sample?.coordinates?.latitude ?? "00.0000° N"}
        </span>
        <span className="absolute bottom-4 right-4 text-meta tracking-widest text-ivory/80">
          {sample?.coordinates?.longitude ?? "00.0000° E"}
        </span>

        {sample && (
          <span className="absolute bottom-4 left-4 font-display text-heading-s text-ivory">
            {sample.title}
          </span>
        )}
      </div>
    </div>
  );
}

export function ArtifactsStage({ sample }: StageProps) {
  const details = [
    { label: "Type", value: sample?.type },
    { label: "Date", value: sample?.dateDisplay },
    { label: "Place", value: sample?.placeName },
    { label: "Source", value: sample?.credit },
  ];

  return (
    <div className="flex h-full flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center p-6 md:flex-[7] md:p-10">
        <div className="flex aspect-square h-full max-h-72 items-center justify-center overflow-hidden rounded-full bg-sand/45 md:max-h-80">
          {sample?.image && (
            <img
              src={sample.image}
              alt={sample.title}
              className="h-4/5 w-4/5 object-contain"
            />
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-6 pt-0 md:flex md:flex-[5] md:flex-col md:justify-center md:gap-5 md:p-10">
        {details.map(({ label, value }) => (
          <div key={label} className="border-t border-ink/25 pt-3">
            <dt className="text-label font-medium uppercase tracking-widest text-muted">
              {label}
            </dt>
            {sample ? (
              <dd className="mt-3 text-body-s">{value ?? "—"}</dd>
            ) : (
              <dd className="mt-3 h-2 w-2/3 bg-ink/10" />
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
