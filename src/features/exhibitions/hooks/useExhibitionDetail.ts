import { useEffect, useState } from "react";
import { ApiError } from "../../../services/api/client";
import { getExhibitionBySlug } from "../api/exhibitions";
import { getSectionsByExhibition } from "../api/sections";
import type { Exhibition } from "../types/exhibitions";
import type { Section } from "../types/sections";

type Settled =
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; exhibition: Exhibition; sections: Section[] };

export type ExhibitionDetailState = { status: "loading" } | Settled;

async function load(slug: string): Promise<Settled> {
  try {
    const exhibition = await getExhibitionBySlug(slug);
    const sections = await getSectionsByExhibition(exhibition.id);

    return {
      status: "ready",
      exhibition,
      sections: [...sections].sort((a, b) => a.section_order - b.section_order),
    };
  } catch (error) {
    return error instanceof ApiError && error.status === 404
      ? { status: "not-found" }
      : { status: "error" };
  }
}

export function useExhibitionDetail(
  slug: string | undefined,
): ExhibitionDetailState {
  const [result, setResult] = useState<{ slug: string; state: Settled } | null>(
    null,
  );

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    load(slug).then((state) => {
      if (!cancelled) setResult({ slug, state });
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) return { status: "not-found" };
  // Ignore a result that belongs to a previous slug.
  if (!result || result.slug !== slug) return { status: "loading" };

  return result.state;
}
