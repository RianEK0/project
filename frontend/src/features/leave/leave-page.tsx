import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  approveLeaveRequest,
  createLeaveRequest,
  getApprovalInbox,
  getLeaveRequests,
  getLeaveTypes,
  rejectLeaveRequest,
  type CreateLeaveRequestPayload,
} from '@/features/leave/leave-api'
import { getErrorMessage } from '@/lib/http'

const leaveSchema = z.object({
  leave_type_id: z.string().min(1, 'Pilih jenis cuti.'),
  start_date: z.string().min(1, 'Tanggal mulai wajib diisi.'),
  end_date: z.string().min(1, 'Tanggal selesai wajib diisi.'),
  reason: z.string().min(10, 'Alasan minimal 10 karakter.'),
})

type LeaveFormValues = z.infer<typeof leaveSchema>

const leaveStatusVariantMap = {
  draft: 'neutral',
  pending_manager: 'warning',
  pending_hr: 'warning',
  approved: 'success',
  rejected: 'danger',
} as const

export function LeavePage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [approvalNotes, setApprovalNotes] = useState<Record<number, string>>({})
  const canCreate = session?.user.permissions.includes('leave-requests.create') ?? false
  const canApprove = session?.user.permissions.includes('leave-requests.approve') ?? false

  const leaveTypesQuery = useQuery({
    queryKey: ['leave-types'],
    queryFn: getLeaveTypes,
  })

  const leaveRequestsQuery = useQuery({
    queryKey: ['leave-requests'],
    queryFn: getLeaveRequests,
  })

  const approvalsQuery = useQuery({
    queryKey: ['approvals', 'inbox'],
    queryFn: getApprovalInbox,
    enabled: canApprove,
  })

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type_id: '',
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
      reason: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => createLeaveRequest(payload),
    onSuccess: () => {
      form.reset({
        leave_type_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
        reason: '',
      })

      void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['approvals'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ leaveRequestId, remarks }: { leaveRequestId: number; remarks?: string }) =>
      approveLeaveRequest(leaveRequestId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['approvals'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ leaveRequestId, remarks }: { leaveRequestId: number; remarks: string }) =>
      rejectLeaveRequest(leaveRequestId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['approvals'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate({
      leave_type_id: Number(values.leave_type_id),
      start_date: values.start_date,
      end_date: values.end_date,
      reason: values.reason,
    })
  })

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="section-kicker">Leave Operations</span>
              <div>
                <CardTitle className="text-3xl">Antrean cuti dan approval yang lebih enak dibaca</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                  Employee mengajukan cuti, manager meninjau, lalu HR menyelesaikan approval
                  final dalam alur yang sekarang lebih rapi secara visual.
                </CardDescription>
              </div>
            </div>
            <div className="rounded-[24px] bg-app-accent px-5 py-4 text-white shadow-[0_24px_40px_-28px_rgba(19,35,60,0.8)]">
              <div className="flex items-center gap-3">
                <CalendarClock className="h-5 w-5 text-[color:var(--app-highlight)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                    Workflow Active
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {leaveRequestsQuery.data?.length ?? 0} requests tracked
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {leaveTypesQuery.data?.map((leaveType) => (
              <div className="stat-card" key={leaveType.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{leaveType.name}</p>
                  <Badge variant={leaveType.is_active ? 'success' : 'neutral'}>
                    {leaveType.default_days} days
                  </Badge>
                </div>
                <p className="mt-2 font-mono text-xs text-app-muted-foreground">
                  {leaveType.code}
                </p>
                <p className="mt-3 text-sm text-app-muted-foreground">
                  {leaveType.description ?? 'Policy description not set.'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Ledger</CardTitle>
            <CardDescription>
              Semua pengajuan cuti yang bisa dilihat oleh role saat ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveRequestsQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading leave requests...</p>
            ) : null}

            {!leaveRequestsQuery.isLoading && leaveRequestsQuery.data?.map((leaveRequest) => (
              <article
                className="data-row px-5 py-5"
                key={leaveRequest.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">
                        {leaveRequest.employee?.full_name ?? 'Unknown employee'}
                      </p>
                      <Badge
                        variant={
                          leaveStatusVariantMap[
                            leaveRequest.status as keyof typeof leaveStatusVariantMap
                          ] ?? 'neutral'
                        }
                      >
                        {leaveRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {leaveRequest.leave_type?.name ?? 'Leave type not set'}
                      {' • '}
                      {formatDate(leaveRequest.start_date)}
                      {' - '}
                      {formatDate(leaveRequest.end_date)}
                      {' • '}
                      {leaveRequest.total_days} days
                    </p>
                    <p className="mt-1 font-mono text-xs text-app-muted-foreground">
                      {leaveRequest.employee?.employee_number ?? 'N/A'}
                      {' • '}
                      {leaveRequest.employee?.department ?? 'No department'}
                      {' • '}
                      {leaveRequest.employee?.team ?? 'No team'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                    Submitted:
                    {' '}
                    <span className="font-medium text-app-foreground">
                      {formatDate(leaveRequest.submitted_at)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-app-foreground">{leaveRequest.reason}</p>

                {leaveRequest.rejection_reason ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Rejection reason:
                    {' '}
                    {leaveRequest.rejection_reason}
                  </div>
                ) : null}

                {leaveRequest.approvals.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {leaveRequest.approvals.map((approval) => (
                      <Badge
                        key={approval.id}
                        variant={approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'danger' : approval.status === 'pending' ? 'warning' : 'neutral'}
                      >
                        {approval.stage}
                        {' • '}
                        {approval.status}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}

            {!leaveRequestsQuery.isLoading && leaveRequestsQuery.data?.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
                <p className="text-lg font-semibold">No leave requests yet</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Pengajuan pertama akan muncul di sini setelah employee submit leave request.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {canApprove ? (
          <Card>
            <CardHeader>
              <CardTitle>Approval Inbox</CardTitle>
              <CardDescription>
                Approval yang sedang menunggu aksi dari akun saat ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvalsQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading approval inbox...</p>
              ) : null}

              {!approvalsQuery.isLoading && approvalsQuery.data?.map((approval) => {
                const remarks = approvalNotes[approval.id] ?? ''
                const leaveRequest = approval.leave_request

                return (
                  <article
                    className="data-row px-5 py-5"
                    key={approval.id}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">
                            {leaveRequest?.employee?.full_name ?? 'Unknown employee'}
                          </p>
                          <Badge variant="warning">{approval.stage} approval</Badge>
                        </div>
                        <p className="mt-2 text-sm text-app-muted-foreground">
                          {leaveRequest?.leave_type?.name ?? 'Leave request'}
                          {' • '}
                          {formatDate(leaveRequest?.start_date)}
                          {' - '}
                          {formatDate(leaveRequest?.end_date)}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-app-muted-foreground">
                        {leaveRequest?.employee?.employee_number ?? 'N/A'}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-app-foreground">
                      {leaveRequest?.reason ?? 'No reason provided.'}
                    </p>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`remarks-${approval.id}`}>Approval Note</Label>
                      <textarea
                        className="field-area min-h-24"
                        id={`remarks-${approval.id}`}
                        value={remarks}
                        onChange={(event) => {
                          setApprovalNotes((current) => ({
                            ...current,
                            [approval.id]: event.target.value,
                          }))
                        }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        type="button"
                        onClick={() => {
                          if (!leaveRequest) {
                            return
                          }

                          approveMutation.mutate({
                            leaveRequestId: leaveRequest.id,
                            remarks: remarks || undefined,
                          })
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        disabled={
                          approveMutation.isPending
                          || rejectMutation.isPending
                          || remarks.trim().length < 5
                        }
                        type="button"
                        variant="danger"
                        onClick={() => {
                          if (!leaveRequest) {
                            return
                          }

                          rejectMutation.mutate({
                            leaveRequestId: leaveRequest.id,
                            remarks,
                          })
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </article>
                )
              })}

              {approveMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getErrorMessage(approveMutation.error)}
                </div>
              ) : null}

              {rejectMutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getErrorMessage(rejectMutation.error)}
                </div>
              ) : null}

              {!approvalsQuery.isLoading && approvalsQuery.data?.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
                  <p className="text-lg font-semibold">Inbox clear</p>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    Tidak ada approval leave yang menunggu aksi saat ini.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </section>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit Leave Request</CardTitle>
            <CardDescription>
              Form pengajuan terhubung langsung ke workflow manager lalu HR.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canCreate ? (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="leave_type_id">Leave Type</Label>
                  <select
                    className="field-select"
                    id="leave_type_id"
                    {...form.register('leave_type_id')}
                  >
                    <option value="">Select leave type</option>
                    {leaveTypesQuery.data?.map((leaveType) => (
                      <option key={leaveType.id} value={leaveType.id}>
                        {leaveType.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-rose-700">
                    {form.formState.errors.leave_type_id?.message}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <input
                      className="field-select"
                      id="start_date"
                      type="date"
                      {...form.register('start_date')}
                    />
                    <p className="text-sm text-rose-700">
                      {form.formState.errors.start_date?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <input
                      className="field-select"
                      id="end_date"
                      type="date"
                      {...form.register('end_date')}
                    />
                    <p className="text-sm text-rose-700">
                      {form.formState.errors.end_date?.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <textarea
                    className="field-area min-h-32"
                    id="reason"
                    {...form.register('reason')}
                  />
                  <p className="text-sm text-rose-700">{form.formState.errors.reason?.message}</p>
                </div>

                {createMutation.isError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {getErrorMessage(createMutation.error)}
                  </div>
                ) : null}

                <Button className="w-full" disabled={createMutation.isPending} type="submit">
                  {createMutation.isPending ? 'Submitting request...' : 'Submit Leave Request'}
                </Button>
              </form>
            ) : (
              <div className="rounded-[24px] border border-dashed border-app-border px-5 py-8 text-center">
                <p className="font-semibold">Leave submission unavailable</p>
                <p className="mt-2 text-sm leading-6 text-app-muted-foreground">
                  Role ini tidak punya permission untuk membuat leave request.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}
