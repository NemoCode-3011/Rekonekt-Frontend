import { http } from "../../services/api/client";
import type {
  PlaceBundle,
  PlaceCard,
  PlaceCategory,
  PlaceDetail,
  PlaceFacets,
  PlaceRegion,
} from "./types";

type ApiReply<T> = { message: string; data: T };

async function get<T>(path: string): Promise<T> {
  return (await http.get<ApiReply<T>>(path)).data.data;
}

export interface PlaceQuery {
  region?: PlaceRegion;
  category?: PlaceCategory;
  q?: string;
}

export function listPlaces(query: PlaceQuery = {}) {
  const params = new URLSearchParams();
  if (query.region) params.set("region", query.region);
  if (query.category) params.set("category", query.category);
  if (query.q?.trim()) params.set("q", query.q.trim());
  const queryString = params.toString();
  const suffix = queryString ? `?${queryString}` : "";
  return get<PlaceCard[]>(`/places${suffix}`);
}

export function getPlaceFacets() {
  return get<PlaceFacets>("/places/facets");
}

export function getPlaceBySlug(slug: string) {
  return get<PlaceDetail>(`/places/slug/${encodeURIComponent(slug)}`);
}

export function getPlaceBundles() {
  return get<PlaceBundle[]>("/places/bundles");
}