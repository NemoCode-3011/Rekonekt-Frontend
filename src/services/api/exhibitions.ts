import { http } from "./client";
import type { Exhibition } from "../../types/exhibitions";

export async function getExhibitions() {
  const res = await http.get<{ message: string; data: Exhibition[] }>("/exhibitions");
  return res.data.data;
}