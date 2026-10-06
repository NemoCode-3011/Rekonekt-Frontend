import { http } from "./client";

// Every backend reply looks like { message, data }. This returns just `data`.
export async function getData<T>(
  path: string,
  params?: Record<string, string>,
) {
  const res = await http.get<{ message: string; data: T }>(path, { params });
  return res.data.data;
}