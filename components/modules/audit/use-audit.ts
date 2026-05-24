import { useQuery } from "@tanstack/react-query";

import { type AuditParams, auditApi } from "./audit-api";

export const AUDIT_KEYS = {
  list: (params: AuditParams) => ["audit", params] as const,
};

export function useAuditLog(params: AuditParams) {
  return useQuery({
    queryKey: AUDIT_KEYS.list(params),
    queryFn: () => auditApi.list(params),
    placeholderData: (prev) => prev,
    retry: 1,
  });
}
