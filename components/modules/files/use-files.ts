import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { type FileTargetType, fileApi } from "./file-api";

export type { FileTargetType };

export const FILE_KEYS = {
  forTarget: (targetType: FileTargetType, targetId: string) =>
    ["files", targetType, targetId] as const,
};

export function useFiles(targetType: FileTargetType, targetId: string | undefined) {
  return useQuery({
    queryKey: FILE_KEYS.forTarget(targetType, targetId ?? ""),
    queryFn: () => fileApi.listForTarget(targetType, targetId!),
    enabled: !!targetId,
  });
}

export function useUploadFile(targetType: FileTargetType, targetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress: (pct: number) => void;
    }) => {
      const { fileId, uploadUrl } = await fileApi.presign({
        targetType,
        targetId,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        size: file.size,
      });
      await fileApi.uploadToPresignedUrl(uploadUrl, file, onProgress);
      return fileApi.confirm(fileId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FILE_KEYS.forTarget(targetType, targetId) }),
  });
}

export function useDeleteFile(targetType: FileTargetType, targetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FILE_KEYS.forTarget(targetType, targetId) }),
  });
}

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (fileId: string) => fileApi.downloadUrl(fileId),
  });
}
