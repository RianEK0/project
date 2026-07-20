import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  AuditLog,
  PaginationMeta,
} from '@/types/api'

export interface AuditLogsResponse {
  items: AuditLog[]
  meta: PaginationMeta | undefined
}

export async function getAuditLogs(action?: string) {
  const { data } = await http.get<ApiEnvelope<AuditLog[]>>('/audit-logs', {
    params: action ? { action } : undefined,
  })

  return {
    items: data.data,
    meta: data.meta,
  } satisfies AuditLogsResponse
}
