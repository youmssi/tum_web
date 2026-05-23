"use client";

import { CameraIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type FileTargetType, fileApi } from "./file-api";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface AvatarUploadProps {
  targetType: Extract<FileTargetType, "PROFILE" | "ORG">;
  targetId: string;
  currentUrl?: string | null;
  initials: string;
  onUploaded: (downloadUrl: string) => void;
}

export function AvatarUpload({
  targetType,
  targetId,
  currentUrl,
  initials,
  onUploaded,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Image exceeds the 5 MB limit.");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const { fileId, uploadUrl } = await fileApi.presign({
        targetType,
        targetId,
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });
      await fileApi.uploadToPresignedUrl(uploadUrl, file, () => {});
      const confirmed = await fileApi.confirm(fileId);
      const { url } = await fileApi.downloadUrl(confirmed.id);
      onUploaded(url);
      toast.success("Photo updated.");
    } catch {
      toast.error("Failed to upload photo.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <button
      type="button"
      className="group relative w-fit"
      onClick={() => !isUploading && inputRef.current?.click()}
      aria-label="Change photo"
    >
      <Avatar className="size-16">
        <AvatarImage src={preview ?? currentUrl ?? undefined} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <CameraIcon className="size-5 text-white" />
      </div>
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}
