import { http } from "../../services/api/client";
import { getData } from "../../services/api/request";
import type { Bookmark } from "./types";

export function getBookmarks() {
  return getData<Bookmark[]>("/bookmarks");
}

export function addBookmark(artifactId: number) {
  return http.post("/bookmarks", { artifactId });
}

export function removeBookmark(bookmarkId: number) {
  return http.delete(`/bookmarks/${bookmarkId}`);
}