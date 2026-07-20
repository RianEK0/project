import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  BriefcaseBusiness,
  ChartColumnBig,
  Clock3,
  UserRoundPlus,
  Users,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { http } from '@/lib/http'
import type { ApiEnvelope, DashboardSummary } from '@/types/api'

async function getDashboardSummary() {
  const { data } = await http.get<ApiEnvelope<DashboardSummary>>('/dashboard')
  return data.data
}

const topMetricConfig = [
  {
    key: 'total_employees',
    label: 'Total Employee',
    icon: Users,
  },
  {
    key: 'attendance_today',
    label: 'Attendance Today',
    icon: Activity,
  },
  {
    key: 'late_employees_today',
    label: 'Late Employee',
    icon: Clock3,
  },
  {
    key: 'leave_today',
    label: 'Leave Today',
    icon: UserRoundPlus,
  },
] as const

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  })

  const departmentBars = data?.charts.department_headcount ?? []
  const attendanceBars = data?.charts.attendance_status_today ?? []
  const hiringTrend = data?.charts.hiring_trend ?? []
  const employmentStatus = data?.charts.employment_status ?? []
  const recruitmentPipeline = data?.recruitment.pipeline ?? []
  const activityTimeline = data?.activity_timeline ?? []
  const recentHires = data?.recent_hires ?? []
  const upcomingInterviews = data?.recruitment.upcoming_interviews ?? []
  const latestRun = data?.payroll.latest_run

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription>
            Backend API belum merespons payload Executive Dashboard seperti yang diharapkan.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="hero-panel">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
                Executive Dashboard
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <ChartColumnBig className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
                {isLoading ? 'Loading live signal' : `Snapshot ${formatDate(data?.date)}`}
              </div>
            </div>

            <div className="space-y-3">
              <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                Satu layar untuk membaca denyut people operations hari ini.
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-8 text-slate-200">
                Headcount, kehadiran, cuti, payroll, recruitment, dan aktivitas operasional
                masuk ke satu executive cockpit yang lebih siap dipakai untuk keputusan cepat.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topMetricConfig.map(({ key, label, icon: Icon }, index) => (
                <article
                  className="stagger-rise rounded-[26px] border border-white/10 bg-white/8 px-5 py-5"
                  key={key}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                        {label}
                      </p>
                      <p className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-white">
                        {isLoading ? '...' : formatNumber(data?.metrics[key] ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/12 p-3 text-[color:var(--app-highlight)]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SignalPill
                description="Active workforce ratio"
                label="Active Employees"
                value={isLoading ? '...' : formatPercent(data?.statistics.active_employee_ratio ?? 0)}
              />
              <SignalPill
                description="Attendance capture today"
                label="Attendance Rate"
                value={isLoading ? '...' : formatPercent(data?.statistics.attendance_capture_rate ?? 0)}
              />
              <SignalPill
                description="Open leave approvals"
                label="Leave Approval"
                value={isLoading ? '...' : formatNumber(data?.statistics.pending_leave_approvals ?? 0)}
              />
              <SignalPill
                description="Pending attendance fixes"
                label="Correction Queue"
                value={isLoading ? '...' : formatNumber(data?.statistics.pending_attendance_corrections ?? 0)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="section-kicker w-fit">Payroll Summary</div>
                  <CardTitle className="pt-3 text-2xl">Payroll pulse</CardTitle>
                </div>
                <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <CardDescription>
                Menyorot nilai gross dan net payroll pada periode yang paling relevan untuk dipantau.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[26px] bg-app-accent px-5 py-5 text-white shadow-[0_24px_40px_-28px_rgba(19,35,60,0.8)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/75">
                  {isLoading ? 'Payroll period' : `Period ${data?.payroll.display_month ?? 'N/A'}`}
                </p>
                <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em]">
                  {isLoading ? '...' : formatCurrency(data?.payroll.stats.display_net ?? 0)}
                </p>
                <p className="mt-2 text-sm text-white/80">
                  Net payroll with gross exposure {isLoading ? '...' : formatCurrency(data?.payroll.stats.display_gross ?? 0)}.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryTile label="Approved Runs" value={isLoading ? '...' : formatNumber(data?.payroll.stats.approved_runs ?? 0)} />
                <SummaryTile label="Run History" value={isLoading ? '...' : formatNumber(data?.payroll.stats.runs_total ?? 0)} />
                <SummaryTile label="Pending Approval" value={isLoading ? '...' : formatNumber(data?.statistics.pending_payroll_approvals ?? 0)} />
              </div>

              <div className="rounded-[22px] border border-app-border bg-app-background/55 px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={badgeVariantForStatus(latestRun?.status)}>
                    {latestRun ? labelize(latestRun.status) : 'No run yet'}
                  </Badge>
                  <span className="text-sm text-app-muted-foreground">
                    {latestRun ? latestRun.title : 'Belum ada run payroll terbaru yang bisa ditampilkan.'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="section-kicker w-fit">Recruitment Summary</div>
                  <CardTitle className="pt-3 text-2xl">Hiring momentum</CardTitle>
                </div>
                <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              </div>
              <CardDescription>
                Posisi terbuka, candidate aktif, dan acceptance rate masuk dalam satu block.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryTile label="Open Vacancies" value={isLoading ? '...' : formatNumber(data?.recruitment.stats.open_vacancies ?? 0)} />
                <SummaryTile label="Active Candidates" value={isLoading ? '...' : formatNumber(data?.recruitment.stats.active_candidates ?? 0)} />
                <SummaryTile label="Interviews" value={isLoading ? '...' : formatNumber(data?.recruitment.stats.upcoming_interviews ?? 0)} />
                <SummaryTile label="Hires" value={isLoading ? '...' : formatNumber(data?.recruitment.stats.hires ?? 0)} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Offer acceptance</p>
                  <p className="text-sm text-app-muted-foreground">
                    {isLoading ? '...' : formatPercent(data?.statistics.offer_acceptance_rate ?? 0)}
                  </p>
                </div>
                <div className="h-2 rounded-full bg-black/8">
                  <div
                    className="h-2 rounded-full bg-[color:var(--app-highlight)]"
                    style={{ width: `${Math.min(100, data?.statistics.offer_acceptance_rate ?? 0)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Charts</div>
            <CardTitle className="pt-3 text-2xl">Department and workforce lens</CardTitle>
            <CardDescription>
              Distribusi headcount per department dan komposisi status karyawan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading department distribution...</p>
              ) : (
                departmentBars.map((department) => (
                  <article className="space-y-2" key={department.id}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{department.name}</p>
                        <p className="text-sm text-app-muted-foreground">
                          {department.head?.full_name ?? 'Head belum ditetapkan'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatNumber(department.employees_count)} employee</p>
                        <p className="text-sm text-app-muted-foreground">
                          {formatPercent(department.share_of_workforce)} of workforce
                        </p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-black/8">
                      <div
                        className="h-2 rounded-full bg-app-accent"
                        style={{ width: `${Math.min(100, department.share_of_workforce)}%` }}
                      />
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {employmentStatus.map((item) => (
                <div className="rounded-[22px] border border-app-border bg-app-background/55 px-4 py-4" key={item.status}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold">{formatNumber(item.value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Statistics</div>
            <CardTitle className="pt-3 text-2xl">Attendance and hiring pulse</CardTitle>
            <CardDescription>
              Breakdown kehadiran hari ini dan tren hiring enam bulan terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <SummaryTile label="On Time" value={isLoading ? '...' : formatNumber(data?.attendance.today.on_time_count ?? 0)} />
              <SummaryTile label="Late" value={isLoading ? '...' : formatNumber(data?.attendance.today.late_count ?? 0)} />
              <SummaryTile label="On Leave" value={isLoading ? '...' : formatNumber(data?.attendance.today.on_leave_count ?? 0)} />
              <SummaryTile label="This Month OT" value={isLoading ? '...' : formatNumber(data?.attendance.month.overtime_minutes_this_month ?? 0)} />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Attendance status today</p>
              {isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading attendance chart...</p>
              ) : (
                <HorizontalBarChart items={attendanceBars} />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">Hiring trend</p>
                <p className="text-sm text-app-muted-foreground">
                  {isLoading ? '...' : `${formatNumber(data?.metrics.new_hires_this_month ?? 0)} hire bulan ini`}
                </p>
              </div>
              {isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading hiring trend...</p>
              ) : (
                <HiringTrendChart items={hiringTrend} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Department Summary</div>
            <CardTitle className="pt-3 text-2xl">Team density by function</CardTitle>
            <CardDescription>
              Fokus pada department dengan headcount terbesar dan siapa leader utamanya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading department summary...</p>
            ) : (
              data?.departments.items.map((department) => (
                <article className="data-row flex flex-col gap-3 px-5 py-4" key={department.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{department.name}</p>
                      <p className="text-sm text-app-muted-foreground">
                        {department.head?.full_name ?? 'Head belum ditetapkan'}
                        {' • '}
                        {department.code}
                      </p>
                    </div>
                    <Badge variant="neutral">{formatPercent(department.share_of_workforce)} share</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SummaryTile label="Employees" value={formatNumber(department.employees_count)} />
                    <SummaryTile label="Active" value={formatNumber(department.active_employees_count)} />
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Activity Timeline</div>
            <CardTitle className="pt-3 text-2xl">Operational activity trail</CardTitle>
            <CardDescription>
              Riwayat aktivitas terbaru lintas modul untuk membantu executive monitoring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading activity timeline...</p>
            ) : activityTimeline.length === 0 ? (
              <EmptyState text="Belum ada aktivitas audit yang tercatat untuk ditampilkan." />
            ) : (
              activityTimeline.map((item) => (
                <article className="data-row px-5 py-4" key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={badgeVariantForAction(item.action)}>{labelizeAction(item.action)}</Badge>
                        <span className="text-xs uppercase tracking-[0.16em] text-app-muted-foreground">
                          {item.actor?.name ?? 'System'}
                        </span>
                      </div>
                      <p className="mt-3 font-semibold">{item.summary}</p>
                    </div>
                    <span className="text-sm text-app-muted-foreground">
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Recent Hire</div>
            <CardTitle className="pt-3 text-2xl">Employee feed</CardTitle>
            <CardDescription>
              Kandidat yang sudah resmi masuk workforce dan sedang membentuk momentum hiring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading recent hires...</p>
            ) : recentHires.length === 0 ? (
              <EmptyState text="Belum ada karyawan baru yang bisa ditampilkan." />
            ) : (
              recentHires.map((employee) => (
                <article
                  className="data-row flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                  key={employee.id}
                >
                  <div>
                    <p className="font-bold">{employee.full_name}</p>
                    <p className="text-sm text-app-muted-foreground">
                      {employee.job_title}
                      {' • '}
                      {employee.department?.name ?? 'No department'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success">{labelize(employee.employment_status)}</Badge>
                    <span className="font-mono text-xs text-app-muted-foreground">
                      {employee.employee_number}
                    </span>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Recruitment Flow</div>
            <CardTitle className="pt-3 text-2xl">Pipeline and interview schedule</CardTitle>
            <CardDescription>
              Stage pipeline dan agenda interview terdekat untuk menjaga ritme hiring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Pipeline board</p>
              {isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading recruitment pipeline...</p>
              ) : (
                <HorizontalBarChart
                  items={recruitmentPipeline.map((item) => ({
                    status: item.stage,
                    label: labelize(item.stage),
                    value: item.count,
                  }))}
                />
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Upcoming interviews</p>
              {isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading interview schedule...</p>
              ) : upcomingInterviews.length === 0 ? (
                <EmptyState text="Belum ada jadwal interview terdekat." />
              ) : (
                upcomingInterviews.map((interview) => (
                  <article className="data-row px-5 py-4" key={interview.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{interview.title}</p>
                        <p className="text-sm text-app-muted-foreground">
                          {interview.application?.candidate?.full_name ?? 'Candidate'}
                          {' • '}
                          {interview.application?.vacancy?.title ?? 'Vacancy'}
                        </p>
                      </div>
                      <Badge variant="warning">{labelize(interview.stage)}</Badge>
                    </div>
                    <p className="mt-3 text-sm text-app-muted-foreground">
                      {formatDateTime(interview.scheduled_at)}
                      {' • '}
                      {interview.location ?? 'Location TBD'}
                    </p>
                  </article>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SignalPill({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/12 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  )
}

function SummaryTile({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[22px] border border-app-border bg-app-background/55 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  )
}

function HorizontalBarChart({
  items,
}: {
  items: Array<{
    status: string
    label: string
    value: number
  }>
}) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article className="space-y-2" key={item.status}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-sm text-app-muted-foreground">{formatNumber(item.value)}</p>
          </div>
          <div className="h-2 rounded-full bg-black/8">
            <div
              className="h-2 rounded-full bg-[color:var(--app-highlight)]"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </article>
      ))}
    </div>
  )
}

function HiringTrendChart({
  items,
}: {
  items: Array<{
    month: string
    label: string
    hires: number
  }>
}) {
  const max = Math.max(...items.map((item) => item.hires), 1)

  return (
    <div className="grid grid-cols-6 gap-3">
      {items.map((item) => (
        <div className="flex flex-col items-center gap-3" key={item.month}>
          <div className="flex h-36 w-full items-end rounded-[20px] bg-app-background/55 px-3 py-3">
            <div
              className="w-full rounded-[14px] bg-app-accent shadow-[0_18px_28px_-24px_rgba(19,35,60,0.95)]"
              style={{ height: `${Math.max(10, (item.hires / max) * 100)}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">{formatNumber(item.hires)}</p>
            <p className="text-xs text-app-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-app-border bg-app-background/45 px-5 py-8 text-center text-sm leading-7 text-app-muted-foreground">
      {text}
    </div>
  )
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(value)}%`
}

function formatCurrency(value: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(new Date(value))
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function labelize(value: string) {
  return value
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function labelizeAction(value: string) {
  return value
    .split('.')
    .slice(-2)
    .map((segment) => labelize(segment))
    .join(' / ')
}

function badgeVariantForStatus(status?: string | null): 'neutral' | 'success' | 'warning' | 'danger' {
  if (!status) {
    return 'neutral'
  }

  if (['approved', 'active', 'filled', 'hired'].includes(status)) {
    return 'success'
  }

  if (['pending_hr', 'pending_super_admin', 'pending', 'offer', 'interview', 'assessment'].includes(status)) {
    return 'warning'
  }

  if (['rejected', 'closed', 'inactive'].includes(status)) {
    return 'danger'
  }

  return 'neutral'
}

function badgeVariantForAction(action: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (action.includes('approved') || action.includes('created') || action.includes('hired')) {
    return 'success'
  }

  if (action.includes('rejected') || action.includes('deleted') || action.includes('archived')) {
    return 'danger'
  }

  if (action.includes('submitted') || action.includes('scheduled') || action.includes('requested')) {
    return 'warning'
  }

  return 'neutral'
}
