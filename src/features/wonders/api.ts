import { getData } from "../../services/api/request";
import type { WonderCard, WonderDetail } from "./types";

// Every published wonder, without its body text. The browse page filters by
// kind itself, so it can offer only the kinds that really exist.
export function getWonders() {
  return getData<WonderCard[]>("/wonders");
}

export function getWonder(slug: string) {
  return getData<WonderDetail>(`/wonders/${encodeURIComponent(slug)}`);
}