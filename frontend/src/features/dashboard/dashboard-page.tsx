import { useQuery } from '@tanstack/react-query'
import { Activity, Building2, ChartColumnBig, UserRoundPlus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { http } from '@/lib/http'
import type { ApiEnvelope, DashboardSummary } from '@/types/api'

async function getDashboardSummary() {
  const { data } = await http.get<ApiEnvelope<DashboardSummary>>('/dashboard')
  return data.data
}

const metricConfig = [
  {
    key: 'total_employees',
    label: 'Total Employees',
    icon: Users,
  },
  {
    key: 'active_employees',
    label: 'Active Employees',
    icon: Activity,
  },
  {
    key: 'total_departments',
    label: 'Departments',
    icon: Building2,
  },
  {
    key: 'new_hires_this_month',
    label: 'New Hires This Month',
    icon: UserRoundPlus,
  },
] as const

export function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardSummary,
  })

  const totalEmployees = data?.metrics.total_employees ?? 0
  const activeEmployees = data?.metrics.active_employees ?? 0
  const activeRatio = totalEmployees > 0
    ? Math.round((activeEmployees / totalEmployees) * 100)
    : 0

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard unavailable</CardTitle>
          <CardDescription>
            Backend API belum merespons seperti yang diharapkan. Pastikan Laravel berjalan dan JWT login sukses.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
      <Card className="hero-panel xl:row-span-2">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              Ringkasan Hari Ini
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <ChartColumnBig className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
              Live Workforce Data
            </div>
          </div>
          <div className="space-y-3">
            <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
              Operasi people yang rapi dimulai dari angka yang jelas.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-8 text-slate-200">
              Dashboard ini merangkum headcount, status aktif, pemetaan department,
              dan ritme hiring bulan berjalan tanpa copy yang terasa seperti template.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[26px] border border-white/10 bg-white/8 px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                Active Headcount
              </p>
              <p className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-white">
                {isLoading ? '...' : `${activeRatio}%`}
              </p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-[color:var(--app-highlight)]"
                  style={{ width: `${activeRatio}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-300">
                {activeEmployees} dari {totalEmployees} karyawan berstatus aktif.
              </p>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/8 px-5 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                Hiring Pace
              </p>
              <p className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-white">
                {isLoading ? '...' : data?.metrics.new_hires_this_month ?? 0}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Karyawan baru pada bulan ini yang sudah masuk ke registry workforce.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-black/12 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">People</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {isLoading ? '...' : data?.metrics.total_employees ?? 0}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/12 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Departments</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {isLoading ? '...' : data?.metrics.total_departments ?? 0}
              </p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/12 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">New Hires</p>
              <p className="mt-2 text-2xl font-bold text-white">
                {isLoading ? '...' : data?.metrics.new_hires_this_month ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="data-grid">
        {metricConfig.map(({ key, label, icon: Icon }, index) => (
          <Card
            className="stagger-rise"
            key={key}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <CardContent className="flex items-start justify-between">
              <div>
                <p className="text-sm text-app-muted-foreground">{label}</p>
                <p className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">
                  {isLoading ? '...' : data?.metrics[key] ?? 0}
                </p>
              </div>
              <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div className="section-kicker w-fit">Hiring Feed</div>
          <CardTitle className="pt-3 text-2xl">Karyawan terbaru yang sudah aktif</CardTitle>
          <CardDescription>
            Snapshot onboarding dari modul workforce untuk memantau siapa yang baru masuk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-sm text-app-muted-foreground">Loading workforce signal...</p>
          ) : (
            data?.recent_hires.map((employee) => (
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
                  <Badge variant="success">{employee.employment_status}</Badge>
                  <span className="font-mono text-xs text-app-muted-foreground">
                    {employee.employee_number}
                  </span>
                </div>
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
