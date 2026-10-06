import {
  getPersonMedia,
  getPersonSources,
  getPlaceMedia,
  getPlaceSources,
  getSectionPeople,
  getSectionPlaces,
  getSectionSources,
} from "./api";
import type {
  ExperienceMedia,
  ExperiencePerson,
  ExperiencePlace,
  ExperienceSource,
} from "./types";
import { useCachedList } from "./useCachedList";

// Each kind of list gets its own cache, because a person with id 3 and a
// place with id 3 are different things.
const sectionPeopleCache = new Map<number, ExperiencePerson[]>();
const sectionPlacesCache = new Map<number, ExperiencePlace[]>();
const sectionSourcesCache = new Map<number, ExperienceSource[]>();
const personSourcesCache = new Map<number, ExperienceSource[]>();
const placeSourcesCache = new Map<number, ExperienceSource[]>();
const personMediaCache = new Map<number, ExperienceMedia[]>();
const placeMediaCache = new Map<number, ExperienceMedia[]>();

// For a chapter
export const useSectionPeople = (sectionId: number) =>
  useCachedList(sectionId, getSectionPeople, sectionPeopleCache);

export const useSectionPlaces = (sectionId: number) =>
  useCachedList(sectionId, getSectionPlaces, sectionPlacesCache);

export const useSectionSources = (sectionId: number) =>
  useCachedList(sectionId, getSectionSources, sectionSourcesCache);

// For the side drawer
export const usePersonSources = (personId: number) =>
  useCachedList(personId, getPersonSources, personSourcesCache);

export const usePlaceSources = (placeId: number) =>
  useCachedList(placeId, getPlaceSources, placeSourcesCache);

export const usePersonMedia = (personId: number) =>
  useCachedList(personId, getPersonMedia, personMediaCache);

export const usePlaceMedia = (placeId: number) =>
  useCachedList(placeId, getPlaceMedia, placeMediaCache);