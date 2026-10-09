import { ApiError, http } from "../../../services/api/client";

export interface UploadedMedia {
  id: number;
  file_url: string;
}

export interface AdminImageMetadata {
  title: string;
  mediaType: "image";
  caption?: string;
  description?: string;
  sourceCredit?: string;
  license?: string;
}

export async function uploadAdminImage(
  file: File,
  metadata: AdminImageMetadata,
  onProgress: (percentage: number) => void,
) {
  const form = new FormData();
  form.append("file", file);
  form.append("title", metadata.title);
  form.append("mediaType", metadata.mediaType);
  for (const field of ["caption", "description", "sourceCredit", "license"] as const) {
    const value = metadata[field];
    if (value) form.append(field, value);
  }

  try {
    const response = await http.post<{
      message: string;
      data: UploadedMedia;
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
      throw new Error(
        "Only admins and super admins can upload images. Sign in with an admin account.",
        { cause: error },
      );
    }
    throw error;
  }
}
