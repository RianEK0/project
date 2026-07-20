import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, CalendarClock, CalendarDays, Clock3, FileText, ShieldCheck } from 'lucide-react'
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
  getLeaveCalendar,
  getLeaveOverview,
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

const reminderSeverityVariantMap = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
} as const

const calendarDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function LeavePage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [approvalNotes, setApprovalNotes] = useState<Record<number, string>>({})
  const [calendarMonth, setCalendarMonth] = useState(todayMonth())
  const canCreate = session?.user.permissions.includes('leave-requests.create') ?? false
  const canApprove = session?.user.permissions.includes('leave-requests.approve') ?? false

  const leaveOverviewQuery = useQuery({
    queryKey: ['leave-overview'],
    queryFn: getLeaveOverview,
  })

  const leaveTypesQuery = useQuery({
    queryKey: ['leave-types'],
    queryFn: getLeaveTypes,
  })

  const leaveRequestsQuery = useQuery({
    queryKey: ['leave-requests'],
    queryFn: getLeaveRequests,
  })

  const leaveCalendarQuery = useQuery({
    queryKey: ['leave-calendar', calendarMonth],
    queryFn: () => getLeaveCalendar(calendarMonth),
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
      start_date: todayString(),
      end_date: todayString(),
      reason: '',
    },
  })

  const selectedLeaveTypeId = form.watch('leave_type_id')
  const selectedLeaveType = leaveTypesQuery.data?.find(
    (leaveType) => String(leaveType.id) === selectedLeaveTypeId,
  )

  const invalidateLeaveWorkspace = () => {
    void queryClient.invalidateQueries({ queryKey: ['leave-overview'] })
    void queryClient.invalidateQueries({ queryKey: ['leave-types'] })
    void queryClient.invalidateQueries({ queryKey: ['leave-requests'] })
    void queryClient.invalidateQueries({ queryKey: ['leave-calendar'] })
    void queryClient.invalidateQueries({ queryKey: ['approvals'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateLeaveRequestPayload) => createLeaveRequest(payload),
    onSuccess: () => {
      form.reset({
        leave_type_id: '',
        start_date: todayString(),
        end_date: todayString(),
        reason: '',
      })
      invalidateLeaveWorkspace()
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ leaveRequestId, remarks }: { leaveRequestId: number; remarks?: string }) =>
      approveLeaveRequest(leaveRequestId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      invalidateLeaveWorkspace()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ leaveRequestId, remarks }: { leaveRequestId: number; remarks: string }) =>
      rejectLeaveRequest(leaveRequestId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      invalidateLeaveWorkspace()
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
    <div className="space-y-6">
      <Card className="hero-panel">
        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
                Leave System
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <CalendarClock className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
                Balance, approval, and reminder
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                Cuti tahunan, sakit, menikah, melahirkan, dan special leave kini hidup dalam satu alur.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
                Modul leave ini sekarang menggabungkan jenis cuti inti, leave balance, approval manager lalu HR,
                kalender bulanan, holiday feed, dan reminder in-app yang membaca jadwal cuti dan approval yang sama.
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={FileText}
              label="Visible Requests"
              value={String(leaveOverviewQuery.data?.stats.visible_requests ?? 0)}
            />
            <MetricCard
              icon={ShieldCheck}
              label="Pending Approvals"
              value={String(leaveOverviewQuery.data?.stats.pending_approvals ?? 0)}
            />
            <MetricCard
              icon={CalendarDays}
              label="Upcoming Leaves"
              value={String(leaveOverviewQuery.data?.stats.upcoming_approved ?? 0)}
            />
            <MetricCard
              icon={Clock3}
              label="Available Days"
              value={formatDayCount(leaveOverviewQuery.data?.stats.available_days_total ?? 0)}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Leave Balance</div>
              <CardTitle className="pt-3 text-2xl">Saldo cuti per kategori</CardTitle>
              <CardDescription>
                Saldo menghitung alokasi, carry over, pending approval, dan cuti yang sudah dipakai pada tahun berjalan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaveOverviewQuery.data?.employee ? (
                <div className="rounded-[24px] border border-app-border bg-white/72 px-5 py-4">
                  <p className="text-lg font-semibold">{leaveOverviewQuery.data.employee.full_name}</p>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    {leaveOverviewQuery.data.employee.employee_number}
                    {' • '}
                    {leaveOverviewQuery.data.employee.department ?? 'No department'}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {leaveOverviewQuery.data?.balances.map((balance) => (
                  <div className="stat-card" key={balance.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: balance.leave_type?.color ?? '#0f172a' }}
                        />
                        <p className="font-bold">{balance.leave_type?.name ?? 'Leave Type'}</p>
                      </div>
                      <Badge variant={balance.available_days <= 3 ? 'warning' : 'success'}>
                        {formatDayCount(balance.available_days)}
                      </Badge>
                    </div>
                    <p className="mt-2 font-mono text-xs text-app-muted-foreground">
                      {balance.leave_type?.code ?? 'N/A'}
                      {' • '}
                      {balance.year}
                    </p>
                    <div className="mt-4 grid gap-2 text-sm text-app-muted-foreground">
                      <p>Allocated: <span className="font-medium text-app-foreground">{formatDayCount(balance.allocated_days)}</span></p>
                      <p>Carry Over: <span className="font-medium text-app-foreground">{formatDayCount(balance.carried_over_days)}</span></p>
                      <p>Pending: <span className="font-medium text-app-foreground">{formatDayCount(balance.pending_days)}</span></p>
                      <p>Used: <span className="font-medium text-app-foreground">{formatDayCount(balance.used_days)}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              {!leaveOverviewQuery.isLoading && (leaveOverviewQuery.data?.balances.length ?? 0) === 0 ? (
                <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                  <p className="text-lg font-semibold">No leave balances available</p>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    Balance cards akan muncul saat akun terhubung ke employee profile yang punya policy leave aktif.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-kicker w-fit">Leave Calendar</div>
                <CardTitle className="pt-3 text-2xl">Kalender cuti dan holiday</CardTitle>
                <CardDescription className="mt-2">
                  Tampilan bulanan memetakan request leave yang terlihat oleh role Anda bersama hari libur perusahaan.
                </CardDescription>
              </div>
              <div className="w-full max-w-[200px] space-y-2">
                <Label htmlFor="leave-calendar-month">Month</Label>
                <input
                  className="field-select"
                  id="leave-calendar-month"
                  onChange={(event) => setCalendarMonth(event.currentTarget.value)}
                  type="month"
                  value={calendarMonth}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {calendarDayLabels.map((label) => (
                  <div
                    className="rounded-2xl bg-black/4 px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-app-muted-foreground"
                    key={label}
                  >
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
                {leaveCalendarQuery.data?.days.map((day) => (
                  <article
                    className={[
                      'min-h-[170px] rounded-[24px] border px-3 py-3',
                      day.is_current_month
                        ? 'border-app-border bg-white/80'
                        : 'border-transparent bg-black/3 text-app-muted-foreground',
                    ].join(' ')}
                    key={day.date}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{day.day}</p>
                      <div className="flex flex-wrap gap-1">
                        {day.is_weekend ? <Badge variant="neutral">Weekend</Badge> : null}
                        {day.holiday ? <Badge variant="warning">Holiday</Badge> : null}
                      </div>
                    </div>

                    {day.holiday ? (
                      <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        <p className="font-semibold">{day.holiday.name}</p>
                        <p className="mt-1 uppercase tracking-[0.12em]">{day.holiday.type}</p>
                      </div>
                    ) : null}

                    <div className="mt-3 space-y-2">
                      {day.events.slice(0, 3).map((event, index) => (
                        <div
                          className="rounded-2xl border px-3 py-2 text-xs"
                          key={`${day.date}-${event.type}-${event.leave_request_id ?? index}`}
                          style={{
                            borderColor: `${event.color ?? '#d1d5db'}55`,
                            backgroundColor: `${event.color ?? '#e5e7eb'}16`,
                          }}
                        >
                          <p className="font-semibold">{event.title}</p>
                          <p className="mt-1 uppercase tracking-[0.12em] text-app-muted-foreground">
                            {event.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                      ))}

                      {day.events.length > 3 ? (
                        <p className="text-xs text-app-muted-foreground">
                          +{day.events.length - 3} more events
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Request Ledger</div>
              <CardTitle className="pt-3 text-2xl">Semua leave request yang terlihat</CardTitle>
              <CardDescription>
                Riwayat pengajuan lengkap dengan total hari terhitung, hari kalender, holiday skip, dan status approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaveRequestsQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading leave requests...</p>
              ) : null}

              {!leaveRequestsQuery.isLoading && leaveRequestsQuery.data?.map((leaveRequest) => (
                <article className="data-row px-5 py-5" key={leaveRequest.id}>
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
                          {leaveRequest.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-app-muted-foreground">
                        {leaveRequest.leave_type?.name ?? 'Leave type not set'}
                        {' • '}
                        {formatDate(leaveRequest.start_date)}
                        {' - '}
                        {formatDate(leaveRequest.end_date)}
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
                      <p>
                        Counted:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {formatDayCount(leaveRequest.total_days)}
                        </span>
                      </p>
                      <p className="mt-1">
                        Calendar:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {leaveRequest.calendar_days ?? '-'} days
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-app-foreground">{leaveRequest.reason}</p>

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
                    {leaveRequest.skipped_holidays.length > 0 ? (
                      <Badge variant="warning">
                        Holiday skip {leaveRequest.skipped_holidays.length}
                      </Badge>
                    ) : null}
                    {leaveRequest.skipped_weekends.length > 0 ? (
                      <Badge variant="neutral">
                        Weekend skip {leaveRequest.skipped_weekends.length}
                      </Badge>
                    ) : null}
                  </div>

                  {leaveRequest.rejection_reason ? (
                    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      Rejection reason:
                      {' '}
                      {leaveRequest.rejection_reason}
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
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Reminder</div>
              <CardTitle className="pt-3 text-2xl">Pengingat leave dan holiday</CardTitle>
              <CardDescription>
                Reminder in-app untuk saldo menipis, leave yang akan dimulai, approval yang menunggu, dan holiday terdekat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaveOverviewQuery.data?.reminders.map((reminder, index) => (
                <article className="data-row px-5 py-5" key={`${reminder.type}-${reminder.date ?? index}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{reminder.title}</p>
                        <Badge
                          variant={
                            reminderSeverityVariantMap[
                              reminder.severity as keyof typeof reminderSeverityVariantMap
                            ] ?? 'neutral'
                          }
                        >
                          {reminder.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-app-muted-foreground">
                        {reminder.description}
                      </p>
                    </div>
                    <Bell className="mt-1 h-4 w-4 text-[color:var(--app-highlight)]" />
                  </div>
                  {reminder.date ? (
                    <p className="mt-3 font-mono text-xs text-app-muted-foreground">{reminder.date}</p>
                  ) : null}
                </article>
              ))}

              {!leaveOverviewQuery.isLoading && (leaveOverviewQuery.data?.reminders.length ?? 0) === 0 ? (
                <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                  <p className="text-lg font-semibold">No reminders right now</p>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    Reminder akan muncul saat ada holiday dekat, saldo menipis, atau approval yang menunggu aksi.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Holiday Feed</div>
              <CardTitle className="pt-3 text-2xl">Hari libur yang relevan untuk perencanaan cuti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaveOverviewQuery.data?.holidays.map((holiday) => (
                <article className="data-row px-5 py-5" key={holiday.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{holiday.name}</p>
                      <p className="mt-1 text-sm text-app-muted-foreground">
                        {holiday.notes ?? 'Company or public holiday'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="warning">{holiday.type}</Badge>
                      <p className="mt-2 font-mono text-xs text-app-muted-foreground">
                        {holiday.holiday_date}
                      </p>
                    </div>
                  </div>
                </article>
              ))}

              {!leaveOverviewQuery.isLoading && (leaveOverviewQuery.data?.holidays.length ?? 0) === 0 ? (
                <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                  <p className="text-lg font-semibold">No holidays in the current window</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submit Leave Request</CardTitle>
              <CardDescription>
                Form pengajuan terhubung langsung ke saldo, aturan holiday, dan workflow manager lalu HR.
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

                  {selectedLeaveType ? (
                    <div className="rounded-[24px] border border-app-border bg-white/72 px-4 py-4 text-sm text-app-muted-foreground">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: selectedLeaveType.color ?? '#0f172a' }}
                        />
                        <p className="font-semibold text-app-foreground">{selectedLeaveType.name}</p>
                        <Badge variant={selectedLeaveType.deducts_balance ? 'success' : 'neutral'}>
                          {selectedLeaveType.deducts_balance ? 'Balance-based' : 'Non-deducting'}
                        </Badge>
                      </div>
                      <p className="mt-3 leading-7">
                        {selectedLeaveType.description ?? 'No policy description yet.'}
                      </p>
                      <p className="mt-3">
                        Default allocation:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {selectedLeaveType.default_days} days
                        </span>
                      </p>
                      <p className="mt-1">
                        Count weekends:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {selectedLeaveType.count_weekends ? 'Yes' : 'No'}
                        </span>
                        {' • '}
                        Count holidays:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {selectedLeaveType.count_holidays ? 'Yes' : 'No'}
                        </span>
                      </p>
                    </div>
                  ) : null}

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

          {canApprove ? (
            <Card>
              <CardHeader>
                <CardTitle>Approval Inbox</CardTitle>
                <CardDescription>
                  Approval leave yang sedang menunggu aksi dari akun saat ini.
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
                    <article className="data-row px-5 py-5" key={approval.id}>
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
                            {' • '}
                            {formatDayCount(leaveRequest?.total_days ?? 0)}
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
                          onChange={(event) => {
                            setApprovalNotes((current) => ({
                              ...current,
                              [approval.id]: event.target.value,
                            }))
                          }}
                          value={remarks}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          onClick={() => {
                            if (!leaveRequest) {
                              return
                            }

                            approveMutation.mutate({
                              leaveRequestId: leaveRequest.id,
                              remarks: remarks || undefined,
                            })
                          }}
                          type="button"
                        >
                          Approve
                        </Button>
                        <Button
                          disabled={
                            approveMutation.isPending
                            || rejectMutation.isPending
                            || remarks.trim().length < 5
                          }
                          onClick={() => {
                            if (!leaveRequest) {
                              return
                            }

                            rejectMutation.mutate({
                              leaveRequestId: leaveRequest.id,
                              remarks,
                            })
                          }}
                          type="button"
                          variant="danger"
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
        </aside>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">{label}</p>
        <Icon className="h-4 w-4 text-[color:var(--app-highlight)]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

function formatDayCount(value: number | string) {
  const normalized = typeof value === 'string' ? Number(value) : value

  if (Number.isNaN(normalized)) {
    return String(value)
  }

  return `${normalized} day${normalized === 1 ? '' : 's'}`
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function todayMonth() {
  return new Date().toISOString().slice(0, 7)
}
