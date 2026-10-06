import type { ArtifactWithMedia } from "../types";
import ArtifactObject from "./ArtifactObject";

interface ArtifactGalleryProps {
  artifacts: ArtifactWithMedia[];
}

// The dark "room" of a chapter where its objects are shown.
// A chapter with no artifacts shows nothing at all.
function ArtifactGallery({ artifacts }: ArtifactGalleryProps) {
  if (artifacts.length === 0) return null;

  return (
    <section
      aria-label="Objects from this chapter"
      className="bg-deep-forest text-ivory"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <h2 className="pt-16 font-display text-heading-s text-sand md:pt-24">
          {artifacts.length} {artifacts.length === 1 ? "object" : "objects"}{" "}
          from this chapter
        </h2>

        <div className="divide-y divide-line-light">
          {artifacts.map((artifact, index) => (
            <ArtifactObject
              key={artifact.id}
              artifact={artifact}
              mirrored={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ArtifactGallery;
