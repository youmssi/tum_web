"use client";

import { DownloadIcon, FileIcon, ImageIcon, FileTextIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { type FileTargetType, useDeleteFile, useDownloadUrl, useFiles } from "./use-files";

function fileIcon(contentType: string) {
  if (contentType.startsWith("image/"))
    return <ImageIcon className="size-4 shrink-0 text-muted-foreground" />;
  if (contentType.includes("pdf") || contentType.includes("text"))
    return <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />;
  return <FileIcon className="size-4 shrink-0 text-muted-foreground" />;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentListProps {
  entityType: FileTargetType;
  entityId: string;
}

export function AttachmentList({ entityType, entityId }: AttachmentListProps) {
  const { data: files, isLoading } = useFiles(entityType, entityId);
  const deleteFile = useDeleteFile(entityType, entityId);
  const downloadUrl = useDownloadUrl();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  async function handleDownload(fileId: string, fileName: string) {
    try {
      const { url } = await downloadUrl.mutateAsync(fileId);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
    } catch {
      toast.error("Could not get download link.");
    }
  }

  async function handleDelete(fileId: string) {
    try {
      await deleteFile.mutateAsync(fileId);
    } catch {
      toast.error("Failed to delete file.");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    );
  }

  const available = (files ?? []).filter((f) => f.status === "AVAILABLE");

  if (!available.length) return null;

  return (
    <div className="space-y-1.5">
      {available.map((file) => (
        <div key={file.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
          {fileIcon(file.contentType)}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{file.fileName}</p>
            <p className="text-xs text-muted-foreground">{formatBytes(file.sizeBytes)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={() => handleDownload(file.id, file.fileName)}
            disabled={downloadUrl.isPending}
          >
            <DownloadIcon className="size-3" />
          </Button>
          {file.ownerId === currentUserId && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-destructive hover:text-destructive"
              onClick={() => handleDelete(file.id)}
              disabled={deleteFile.isPending}
            >
              <Trash2Icon className="size-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
