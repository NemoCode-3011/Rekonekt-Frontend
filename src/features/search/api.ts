import { getData } from "../../services/api/request";
import type { SearchResult } from "./types";

export function searchContent(query: string) {
  return getData<SearchResult[]>("/search", { q: query });
}