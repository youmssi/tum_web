import { api } from "@/lib/api-client";

export type FileTargetType = "TASK" | "COMMENT" | "PROFILE" | "ORG";

export interface AttachedFile {
  id: string;
  organizationId: string;
  ownerId: string;
  targetType: FileTargetType;
  targetId: string;
  fileName: string;
  contentType: string;
  size: number;
  status: "PENDING" | "AVAILABLE";
  createdAt: string;
}

interface PresignResponse {
  fileId: string;
  uploadUrl: string;
}

interface DownloadUrlResponse {
  url: string;
}

export const fileApi = {
  presign: (data: {
    targetType: FileTargetType;
    targetId: string;
    fileName: string;
    contentType: string;
    size: number;
  }) => api.post("api/files/presign", { json: data }).json<PresignResponse>(),

  confirm: (fileId: string) =>
    api.post(`api/files/${fileId}/confirm`).json<AttachedFile>(),

  listForTarget: (targetType: FileTargetType, targetId: string) =>
    api
      .get("api/files", { searchParams: { targetType, targetId } })
      .json<AttachedFile[]>(),

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
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed: ${xhr.status}`));
      });
      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  },
};
