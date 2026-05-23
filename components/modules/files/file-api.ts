import { api } from "@/lib/api-client";

export type FileTargetType = "TASK" | "COMMENT" | "PROFILE" | "ORG_LOGO";

export interface AttachedFile {
  id: string;
  organizationId: string;
  ownerId: string;
  entityType: FileTargetType;
  entityId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  status: "PENDING" | "AVAILABLE";
  createdAt: string;
}

interface PresignResponse {
  id: string;
  uploadUrl: string;
}

interface DownloadUrlResponse {
  url: string;
}

export const fileApi = {
  presign: (data: {
    entityType: FileTargetType;
    entityId: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) => api.post("api/files/presign", { json: data }).json<PresignResponse>(),

  confirm: (fileId: string) => api.post(`api/files/${fileId}/confirm`).json<AttachedFile>(),

  listForEntity: (entityType: FileTargetType, entityId: string) =>
    api.get("api/files", { searchParams: { entityType, entityId } }).json<AttachedFile[]>(),

  downloadUrl: (fileId: string) =>
    api.get(`api/files/${fileId}/download-url`).json<DownloadUrlResponse>(),

  remove: async (fileId: string) => {
    await api.delete(`api/files/${fileId}`);
  },

  uploadToPresignedUrl(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  },
};
