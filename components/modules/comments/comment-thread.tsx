"use client";

import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "./use-comments";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface CommentInputProps {
  taskId: string;
  members: Array<{ userId: string; user?: { name?: string | null; email?: string } | null }>;
}

function CommentInput({ taskId, members }: CommentInputProps) {
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

  function insertMention(member: {
    userId: string;
    user?: { name?: string | null; email?: string } | null;
  }) {
    if (!mention || !textareaRef.current) return;
    const name = member.user?.name ?? member.user?.email ?? member.userId;
    const cursor = textareaRef.current.selectionStart;
    const after = content.slice(cursor);
    setContent(`${content.slice(0, mention.start)}@${name} ${after}`);
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
      toast.error("Failed to post comment.");
    }
  }

  const suggestions = mention
    ? members.filter((m) =>
        (m.user?.name ?? "").toLowerCase().includes(mention.query.toLowerCase()),
      )
    : [];

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          placeholder="Add a comment… (type @ to mention)"
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
                    {(m.user?.name ?? "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {m.user?.name ?? m.user?.email ?? m.userId}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button
          size="sm"
          disabled={!content.trim() || createComment.isPending}
          onClick={handleSubmit}
        >
          {createComment.isPending ? "Posting…" : "Comment"}
        </Button>
      </div>
    </div>
  );
}

interface CommentThreadProps {
  taskId: string;
}

export function CommentThread({ taskId }: CommentThreadProps) {
  const { data: comments, isLoading } = useComments(taskId);
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const members = activeOrg?.members ?? [];
  const currentUserId = session?.user?.id;

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
      toast.error("Failed to update comment.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteComment.mutateAsync(id);
    } catch {
      toast.error("Failed to delete comment.");
    }
  }

  function memberName(userId: string) {
    const m = members.find((m) => m.userId === userId);
    return m?.user?.name ?? m?.user?.email ?? userId;
  }

  function memberInitials(userId: string) {
    const name = memberName(userId);
    return name.slice(0, 2).toUpperCase();
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Comments</p>

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
        <p className="text-sm text-muted-foreground">No comments yet.</p>
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
                      <span className="text-xs text-muted-foreground">(edited)</span>
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
