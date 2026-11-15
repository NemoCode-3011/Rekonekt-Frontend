import { ApiError, http } from "../../../services/api/client";

export interface UploadedMedia {
  id: number;
  file_url: string;
}

export interface AdminMediaRecord extends UploadedMedia {
  title: string;
  media_type: "image" | "document" | "audio" | "video";
  caption: string | null;
  description: string | null;
  source_credit: string | null;
  license: string | null;
  video_provider: "youtube" | null;
  embed_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminEventMedia extends AdminMediaRecord {
  attachment_id: number;
  display_order: number;
}

export interface AdminMediaMetadata {
  title: string;
  caption?: string;
  description?: string;
  sourceCredit?: string;
  license?: string;
}

async function uploadAdminFile<T extends UploadedMedia>(
  file: File,
  metadata: AdminMediaMetadata,
  onProgress: (percentage: number) => void,
  failureMessage: string,
) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", metadata.title);
  for (const field of ["caption", "description", "sourceCredit", "license"] as const) {
    const value = metadata[field];
    if (value) form.append(field, value);
  }

  try {
    const response = await http.post<{
      message: string;
      data: T;
    }>("/media/upload", form, {
      withCredentials: true,
      onUploadProgress: (event) => {
        if (event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    });
    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      throw new Error(failureMessage, { cause: error });
    }
    throw error;
  }
}

export function uploadAdminImage(
  file: File,
  metadata: AdminMediaMetadata,
  onProgress: (percentage: number) => void,
) {
  return uploadAdminFile<UploadedMedia>(
    file,
    metadata,
    onProgress,
    "Only admins and super admins can upload images. Sign in with an admin account.",
  );
}

export function uploadAdminVideo(
  file: File,
  metadata: AdminMediaMetadata,
  onProgress: (percentage: number) => void,
) {
  return uploadAdminFile<AdminMediaRecord>(
    file,
    metadata,
    onProgress,
    "Only admins and super admins can upload videos. Sign in with an admin account.",
  );
}

export async function createAdminYouTubeMedia(
  metadata: AdminMediaMetadata & { youtubeUrl: string },
) {
  const response = await http.post<{
    message: string;
    data: AdminMediaRecord;
  }>("/media/youtube", metadata);
  return response.data.data;
}

export async function getAdminEventMedia(eventId: number) {
  const response = await http.get<{
    message: string;
    data: AdminEventMedia[];
  }>(`/admin/events/${eventId}/media`);
  return response.data.data;
}

export function attachAdminMediaToEvent(
  mediaId: number,
  eventId: number,
  displayOrder: number,
) {
  return http.post("/media-attachment", { mediaId, eventId, displayOrder });
}

export function removeAdminEventMedia(attachmentId: number) {
  return http.delete(`/media-attachment/${attachmentId}`);
}
