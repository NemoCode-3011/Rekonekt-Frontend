import { http } from "../../services/api/client";
import type { Experience, ExperienceEvent } from "./types";

export async function getExperienceBySlug(slug: string) {
  const res = await http.get<{
    message: string;
    data: Experience;
  }>(`/experiences/${slug}`);

  return res.data.data;
}

export async function getSectionEvents(sectionId: number) {
  const res = await http.get<{
    message: string;
    data: ExperienceEvent[];
  }>(`/events/sections/${sectionId}`);

  return res.data.data;
}