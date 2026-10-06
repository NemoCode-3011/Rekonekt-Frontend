import { http } from "../../../services/api/client";
import type { Section } from "../types/sections";

export async function getSectionsByExhibition(exhibitionId: number) {
  const res = await http.get<{
    message: string;
    data: Section[];
  }>(`/sections/exhibitions/${exhibitionId}`);

  return res.data.data;
}