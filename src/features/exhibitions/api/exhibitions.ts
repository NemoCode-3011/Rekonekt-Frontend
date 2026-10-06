import { http } from "../../../services/api/client";
import type { Exhibition } from "../types/exhibitions";

export async function getExhibitions() {
  const res = await http.get<{
    message: string;
    data: Exhibition[];
  }>("/exhibitions");

  return res.data.data;
}

export async function getExhibitionBySlug(slug: string) {
  const res = await http.get<{
    message: string;
    data: Exhibition;
  }>(`/exhibitions/${slug}`);

  return res.data.data;
}
