import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getAuditLogs } from '@/features/governance/governance-api'

const auditActions = [
  '',
  'employee.created',
  'employee.updated',
  'employee.archived',
  'organization.team.created',
  'leave-request.created',
  'leave-request.approved',
  'leave-request.rejected',
] as const

export function AuditLogsPage() {
  const [action, setAction] = useState<string>('')
  const logsQuery = useQuery({
    queryKey: ['audit-logs', action],
    queryFn: () => getAuditLogs(action || undefined),
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="section-kicker">Governance</span>
            <div>
              <CardTitle className="text-3xl">Jejak perubahan sistem yang lebih bersih</CardTitle>
              <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                Perubahan penting dari employee, organization, dan leave workflow
                tetap terekam, sekarang dengan tampilan yang lebih tenang dibaca.
              </CardDescription>
            </div>
          </div>
          <div className="rounded-[24px] bg-app-accent px-5 py-4 text-white shadow-[0_24px_40px_-28px_rgba(19,35,60,0.8)]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[color:var(--app-highlight)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                  Audit Feed
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {logsQuery.data?.meta?.total ?? 0} events indexed
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Event Stream</CardTitle>
            <CardDescription>
              Filter event berdasarkan domain action yang sudah di-capture backend.
            </CardDescription>
          </div>
          <div className="w-full md:max-w-sm">
            <select
              className="field-select"
              value={action}
              onChange={(event) => setAction(event.target.value)}
            >
              <option value="">All actions</option>
              {auditActions.filter(Boolean).map((auditAction) => (
                <option key={auditAction} value={auditAction}>
                  {auditAction}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {logsQuery.isLoading ? (
            <p className="text-sm text-app-muted-foreground">Loading audit events...</p>
          ) : null}

          {!logsQuery.isLoading && logsQuery.data?.items.map((log) => (
            <article
              className="data-row px-5 py-5"
              key={log.id}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{log.summary}</p>
                    <Badge variant="neutral">{log.action}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-app-muted-foreground">
                    Actor:
                    {' '}
                    <span className="font-medium text-app-foreground">
                      {log.actor?.name ?? 'System'}
                    </span>
                    {' • '}
                    {log.actor?.email ?? 'No email'}
                  </p>
                </div>
                <div className="rounded-2xl bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                  {formatDateTime(log.created_at)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-app-muted-foreground">
                <span>IP: {log.ip_address ?? 'N/A'}</span>
              </div>

              {log.old_values ? (
                <details className="mt-4 rounded-[20px] border border-app-border bg-app-background/55 px-4 py-3">
                  <summary className="cursor-pointer font-medium">Previous values</summary>
                  <pre className="mt-3 overflow-x-auto text-xs leading-6 text-app-muted-foreground">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </details>
              ) : null}

              {log.new_values ? (
                <details className="mt-3 rounded-[20px] border border-app-border bg-app-background/55 px-4 py-3">
                  <summary className="cursor-pointer font-medium">New values</summary>
                  <pre className="mt-3 overflow-x-auto text-xs leading-6 text-app-muted-foreground">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </details>
              ) : null}
            </article>
          ))}

          {!logsQuery.isLoading && logsQuery.data?.items.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
              <p className="text-lg font-semibold">No audit events found</p>
              <p className="mt-1 text-sm text-app-muted-foreground">
                Coba ubah filter action atau lakukan perubahan data baru dari modul lain.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
