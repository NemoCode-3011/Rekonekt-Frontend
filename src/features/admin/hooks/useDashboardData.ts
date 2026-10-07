import { useCallback, useEffect, useState } from "react";
import {
  getAdminArtifacts,
  getAdminEvents,
  getAdminExhibitions,
  getAdminPeople,
  getAdminPlaces,
  getAdminSections,
  getAdminStories,
} from "../api/dashboard";
import type {
  DashboardCollection,
  DashboardData,
} from "../types/dashboard";

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: true,
  refreshing: false,
  error: null,
};

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "We couldn't load the admin dashboard. Please try again.";
}

async function loadCollection<T>(
  request: Promise<T[]>,
): Promise<DashboardCollection<T>> {
  try {
    return { items: await request, error: null };
  } catch (error) {
    return { items: null, error: errorMessage(error) };
  }
}

export function useDashboardData() {
  const [state, setState] = useState(initialState);

  const refresh = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: current.data === null,
      refreshing: current.data !== null,
      error: null,
    }));

    try {
      const [
        exhibitionResult,
        events,
        people,
        places,
        artifacts,
        stories,
      ] = await Promise.all([
        getAdminExhibitions()
          .then((result) => ({
            collection: {
              items: result.exhibitions.map((record) => ({
                ...record,
                kind: "Exhibition" as const,
              })),
              error: null,
            },
            summary: {
              totalCount: result.totalCount,
              publishedCount: result.publishedCount,
              draftCount: result.draftCount,
              recentlyUpdated: result.recentlyUpdated,
            },
          }))
          .catch((error: unknown) => ({
            collection: {
              items: null,
              error: errorMessage(error),
            },
            summary: null,
          })),
        loadCollection(getAdminEvents()),
        loadCollection(getAdminPeople()),
        loadCollection(getAdminPlaces()),
        loadCollection(getAdminArtifacts()),
        loadCollection(getAdminStories()),
      ]);

      const exhibitions = exhibitionResult.collection;
      let sections: DashboardData["sections"] = null;
      let sectionsError: string | null = null;
      if (exhibitions.items) {
        const sectionResults = await Promise.all(
          exhibitions.items.map((exhibition) =>
            loadCollection(getAdminSections(exhibition.id)),
          ),
        );
        const failedSectionLoad = sectionResults.find((result) => result.error);
        if (failedSectionLoad) {
          sectionsError = failedSectionLoad.error;
        } else {
          sections = sectionResults.flatMap((result) => result.items ?? []);
        }
      } else {
        sectionsError =
          "Sections are unavailable because the exhibition list could not be loaded.";
      }

      const collections: DashboardData["collections"] = {
        exhibitions: {
          ...exhibitions,
          items:
            exhibitions.items?.map((record) => ({
              ...record,
              kind: "Exhibition" as const,
            })) ?? null,
        },
        events: {
          ...events,
          items:
            events.items?.map((record) => ({
              ...record,
              kind: "Event" as const,
            })) ?? null,
        },
        people: {
          ...people,
          items:
            people.items?.map((record) => ({
              ...record,
              kind: "Person" as const,
            })) ?? null,
        },
        places: {
          ...places,
          items:
            places.items?.map((record) => ({
              ...record,
              kind: "Place" as const,
            })) ?? null,
        },
        artifacts: {
          ...artifacts,
          items:
            artifacts.items?.map((record) => ({
              ...record,
              kind: "Artifact" as const,
            })) ?? null,
        },
        stories: {
          ...stories,
          items:
            stories.items?.map((record) => ({
              ...record,
              kind: "Story" as const,
            })) ?? null,
        },
      };

      setState({
        data: {
          collections,
          exhibitionSummary: exhibitionResult.summary,
          sections,
          sectionsError,
        },
        loading: false,
        refreshing: false,
        error: null,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: errorMessage(error),
      }));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { ...state, refresh };
}
