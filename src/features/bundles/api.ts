import { http } from "../../services/api/client";
import type { Bundle, BundleKind } from "./types";

export async function getBundles(kind: BundleKind) {
  const res = await http.get<{ message: string; data: Bundle[] }>(
    `/${kind}/bundles`,
  );
  return res.data.data;
}