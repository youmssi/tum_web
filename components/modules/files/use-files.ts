import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type FileTargetType, fileApi } from "./file-api";

export type { FileTargetType };

export const FILE_KEYS = {
  forEntity: (entityType: FileTargetType, entityId: string) =>
    ["files", entityType, entityId] as const,
};

export function useFiles(entityType: FileTargetType, entityId: string | undefined) {
  return useQuery({
    queryKey: FILE_KEYS.forEntity(entityType, entityId ?? ""),
    queryFn: () => fileApi.listForEntity(entityType, entityId!),
    enabled: !!entityId,
  });
}

export function useUploadFile(entityType: FileTargetType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress: (pct: number) => void }) => {
      const { id, uploadUrl } = await fileApi.presign({
        entityType,
        entityId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      await fileApi.uploadToPresignedUrl(uploadUrl, file, onProgress);
      return fileApi.confirm(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FILE_KEYS.forEntity(entityType, entityId) }),
  });
}

export function useDeleteFile(entityType: FileTargetType, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FILE_KEYS.forEntity(entityType, entityId) }),
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (fileId: string) => fileApi.downloadUrl(fileId),
  });
}
