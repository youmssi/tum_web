"use client";

import { AtSignIcon, CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useDirectory, type DirectoryMember } from "@/components/modules/organization";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "./use-comments";

function useRelativeTime() {
  const locale = useLocale();
  return (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (m < 1) return rtf.format(0, "minute");
    if (m < 60) return rtf.format(-m, "minute");
    const h = Math.floor(m / 60);
    if (h < 24) return rtf.format(-h, "hour");
    const d = Math.floor(h / 24);
    if (d < 7) return rtf.format(-d, "day");
    return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric" });
  };
}

interface CommentInputProps {
  taskId: string;
  members: DirectoryMember[];
}

function CommentInput({ taskId, members }: CommentInputProps) {
  const t = useTranslations("comments");
  const [content, setContent] = useState("");
  const [mention, setMention] = useState<{ query: string; start: number } | null>(null);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createComment = useCreateComment(taskId);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);
    const cursor = e.target.selectionStart ?? val.length;
    const match = val.slice(0, cursor).match(/@(\w*)$/);
    setMention(match ? { query: match[1], start: cursor - match[0].length } : null);
  }

  function insertMention(member: DirectoryMember) {
    if (!mention || !textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart;
    const after = content.slice(cursor);
    setContent(`${content.slice(0, mention.start)}@${member.name} ${after}`);
    setMentionedUserIds((prev) => (prev.includes(member.userId) ? prev : [...prev, member.userId]));
    setMention(null);
    textareaRef.current.focus();
  }

  async function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      await createComment.mutateAsync({ content: trimmed, mentionedUserIds });
      setContent("");
      setMention(null);
      setMentionedUserIds([]);
    } catch {
      toast.error(t("postFailed"));
    }
  }

  const suggestions = mention
    ? members.filter((m) => m.name.toLowerCase().includes(mention.query.toLowerCase()))
    : [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder={t("placeholder")}
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            {suggestions.map((m) => (
              <button
                key={m.userId}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertMention(m);
                }}
              >
                <Avatar className="size-5">
                  <AvatarFallback className="text-xs">
                    {m.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <AtSignIcon className="size-3" />
          {t("mentionTip")}
        </p>
        <Button
          size="sm"
          disabled={!content.trim() || createComment.isPending}
          onClick={handleSubmit}
        >
          {createComment.isPending ? t("submitting") : t("submit")}
        </Button>
      </div>
    </div>
  );
}

interface CommentThreadProps {
  taskId: string;
}

export function CommentThread({ taskId }: CommentThreadProps) {
  const t = useTranslations("comments");
  const relativeTime = useRelativeTime();
  const { data: comments, isLoading } = useComments(taskId);
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const { data: session } = authClient.useSession();
  const { data: directory } = useDirectory();
  const currentUserId = session?.user?.id;
  // Filter the caller out of the mention list — you can't notify yourself; the backend keeps a
  // defensive drop too so a hand-crafted client can't bypass it.
  const members = (directory ?? []).filter((m) => m.userId !== currentUserId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  function startEdit(id: string, content: string) {
    setEditingId(id);
    setEditContent(content);
  }

  async function submitEdit(id: string) {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    try {
      await updateComment.mutateAsync({ id, content: trimmed });
      setEditingId(null);
    } catch {
      toast.error(t("updateFailed"));
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteComment.mutateAsync(id);
    } catch {
      toast.error(t("deleteFailed"));
    }
  }

  // For displaying author names on existing comments, look up across the full directory (the caller
  // included) so their own past comments still render with their name. When the author has left
  // the org (no longer in the directory) we render a human label instead of the raw user id.
  function memberName(userId: string) {
    const m = (directory ?? []).find((m) => m.userId === userId);
    return m?.name ?? "Former member";
  }

  function memberInitials(userId: string) {
    const name = memberName(userId);
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">{t("header")}</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <Skeleton className="h-16 flex-1 rounded-md" />
            </div>
          ))}
        </div>
      ) : comments?.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {comments?.map((comment) => {
            const isOwn = comment.authorId === currentUserId;
            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="mt-0.5 size-7 shrink-0">
                  <AvatarFallback className="text-xs">
                    {memberInitials(comment.authorId)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{memberName(comment.authorId)}</span>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(comment.createdAt)}
                    </span>
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-muted-foreground">{t("edited")}</span>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="space-y-1">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={() => submitEdit(comment.id)}
                          disabled={updateComment.isPending}
                        >
                          <CheckIcon className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={() => setEditingId(null)}
                        >
                          <XIcon className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/comment flex items-start gap-1">
                      <p className="flex-1 text-sm whitespace-pre-wrap">{comment.content}</p>
                      {isOwn && (
                        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover/comment:opacity-100">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6"
                            onClick={() => startEdit(comment.id, comment.content)}
                          >
                            <PencilIcon className="size-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(comment.id)}
                            disabled={deleteComment.isPending}
                          >
                            <Trash2Icon className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Separator />
      <CommentInput taskId={taskId} members={members} />
    </div>
  );
}
