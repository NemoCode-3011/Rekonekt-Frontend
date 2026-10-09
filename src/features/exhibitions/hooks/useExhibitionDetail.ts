import { useEffect, useState } from "react";
import { ApiError } from "../../../services/api/client";
import { getExhibitionBySlug } from "../api/exhibitions";
import { getSectionsByExhibition } from "../api/sections";
import type { Exhibition } from "../types/exhibitions";
import type { Section } from "../types/sections";
import type { User } from "../../auth/types";

type Settled =
  | { status: "not-found" }
  | { status: "error" }
  | {
      status: "ready";
      exhibition: Exhibition;
      sections: Section[];
      accessRequired?: "signup" | "signin";
    };

export type ExhibitionDetailState = { status: "loading" } | Settled;

async function load(slug: string, canReadContent: boolean): Promise<Settled> {
  let exhibition: Exhibition;
  try {
    exhibition = await getExhibitionBySlug(slug);
  } catch (error) {
    return error instanceof ApiError && error.status === 404
      ? { status: "not-found" }
      : { status: "error" };
  }

  if (!canReadContent) {
    return {
      status: "ready",
      exhibition,
      sections: [],
      accessRequired: "signup",
    };
  }

  try {
    const sections = await getSectionsByExhibition(exhibition.id);
    return {
      status: "ready",
      exhibition,
      sections: [...sections].sort((a, b) => a.section_order - b.section_order),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return {
        status: "ready",
        exhibition,
        sections: [],
        accessRequired: error.code === "SIGNUP_REQUIRED" ? "signup" : "signin",
      };
    }
    return { status: "error" };
  }
}

export function useExhibitionDetail(
  slug: string | undefined,
  user: User | null,
  authLoading: boolean,
): ExhibitionDetailState {
  const [result, setResult] = useState<{ slug: string; state: Settled } | null>(
    null,
  );

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    load(slug, !authLoading && user !== null).then((state) => {
      if (!cancelled) setResult({ slug, state });
    });

    return () => {
      cancelled = true;
    };
  }, [slug, user, authLoading]);

  if (!slug) return { status: "not-found" };
  // Ignore a result that belongs to a previous slug.
  if (!result || result.slug !== slug) return { status: "loading" };

  return result.state;
}
