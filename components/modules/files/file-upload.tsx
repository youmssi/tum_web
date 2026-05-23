"use client";

import { UploadCloudIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { type FileTargetType, useUploadFile } from "./use-files";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

interface FileUploadProps {
  entityType: FileTargetType;
  entityId: string;
  accept?: string;
  onSuccess?: () => void;
}

export function FileUpload({ entityType, entityId, accept = "*/*", onSuccess }: FileUploadProps) {
  const upload = useUploadFile(entityType, entityId);
  const [progress, setProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File exceeds the 10 MB limit.");
      return;
    }
    setProgress(0);
    try {
      await upload.mutateAsync({ file, onProgress: setProgress });
      toast.success(`${file.name} uploaded.`);
      onSuccess?.();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  const isUploading = progress !== null;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload file"
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center transition-colors ${
        isDragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/30 hover:border-primary/50"
      } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={onDrop}
    >
      <UploadCloudIcon className="size-6 text-muted-foreground" />
      {isUploading ? (
        <div className="w-full space-y-1">
          <p className="text-xs text-muted-foreground">Uploading… {progress}%</p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Drop a file here or <span className="text-primary underline">browse</span>
          <br />
          Max 10 MB
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onInputChange}
      />
    </div>
  );
}
