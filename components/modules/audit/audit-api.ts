import { api } from "@/lib/api-client";

export type AuditAction =
  | "TASK_CREATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_ASSIGNED"
  | "COMMENT_ADDED";

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  TASK_CREATED: "Task created",
  TASK_STATUS_CHANGED: "Status changed",
  TASK_ASSIGNED: "Task assigned",
  COMMENT_ADDED: "Comment added",
};

export interface AuditEntry {
  id: string;
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  detail: string | null;
  createdAt: string;
}

/** Spring Data PagedModel shape. */
interface SpringPage<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface AuditPage {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditParams {
  entityType?: string;
  entityId?: string;
  action?: string;
  /** 1-indexed page number */
  page?: number;
  pageSize?: number;
}

export const auditApi = {
  list: async (params: AuditParams = {}): Promise<AuditPage> => {
    const searchParams: Record<string, string> = {};
    if (params.entityType) searchParams.entityType = params.entityType;
    if (params.entityId) searchParams.entityId = params.entityId;
    if (params.action) searchParams.action = params.action;
    // Spring Pageable is 0-indexed; frontend is 1-indexed
    searchParams.page = String((params.page ?? 1) - 1);
    searchParams.size = String(params.pageSize ?? 25);

    const raw = await api.get("api/audit", { searchParams }).json<SpringPage<AuditEntry>>();
    return {
      entries: raw.content,
      total: raw.page.totalElements,
      page: raw.page.number + 1,
      pageSize: raw.page.size,
      totalPages: raw.page.totalPages,
    };
  },
};
