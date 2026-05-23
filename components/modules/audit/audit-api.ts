import { api } from "@/lib/api-client";

export type AuditAction =
  | "MEMBER_INVITED"
  | "MEMBER_REMOVED"
  | "MEMBER_ROLE_CHANGED"
  | "PROJECT_CREATED"
  | "PROJECT_ARCHIVED"
  | "PROJECT_DELETED"
  | "TASK_CREATED"
  | "TASK_DELETED"
  | "COMMENT_DELETED"
  | "ORG_SETTINGS_UPDATED";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  MEMBER_INVITED: "Member invited",
  MEMBER_REMOVED: "Member removed",
  MEMBER_ROLE_CHANGED: "Role changed",
  PROJECT_CREATED: "Project created",
  PROJECT_ARCHIVED: "Project archived",
  PROJECT_DELETED: "Project deleted",
  TASK_CREATED: "Task created",
  TASK_DELETED: "Task deleted",
  COMMENT_DELETED: "Comment deleted",
  ORG_SETTINGS_UPDATED: "Settings updated",
};

export interface AuditEntry {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  targetName: string;
  detail: string | null;
  createdAt: string;
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditParams {
  actor?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export const auditApi = {
  list: (params: AuditParams = {}) => {
    const searchParams: Record<string, string> = {};
    if (params.actor) searchParams.actor = params.actor;
    if (params.action) searchParams.action = params.action;
    if (params.from) searchParams.from = params.from;
    if (params.to) searchParams.to = params.to;
    if (params.page) searchParams.page = String(params.page);
    if (params.pageSize) searchParams.pageSize = String(params.pageSize);
    return api.get("api/audit", { searchParams }).json<AuditPage>();
  },
};
