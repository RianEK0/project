import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BanknoteArrowDown,
  Calculator,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  ReceiptText,
  RotateCcw,
  Send,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  approvePayrollRun,
  downloadPayrollRunExcel,
  downloadPayrollRunPdf,
  downloadPayslipPdf,
  generatePayrollRun,
  getPayrollApprovals,
  getPayrollLookups,
  getPayrollOverview,
  getPayrollPayslips,
  getPayrollRun,
  getPayrollRuns,
  rejectPayrollRun,
  updatePayrollItem,
} from '@/features/payroll/payroll-api'
import { getErrorMessage } from '@/lib/http'

const payrollStatusVariantMap = {
  draft: 'neutral',
  pending_hr: 'warning',
  pending_super_admin: 'warning',
  approved: 'success',
  rejected: 'danger',
} as const

export function PayrollPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canManage = session?.user.permissions.includes('payroll.manage') ?? false
  const canView = session?.user.permissions.includes('payroll.view') ?? false
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [downloadKey, setDownloadKey] = useState<string | null>(null)
  const [approvalNotes, setApprovalNotes] = useState<Record<number, string>>({})
  const [generateForm, setGenerateForm] = useState({
    payroll_month: '',
    title: '',
    period_start: '',
    period_end: '',
    tax_rate: '0.05',
    bpjs_health_rate: '0.01',
    bpjs_employment_rate: '0.02',
    overtime_multiplier: '1',
    overtime_rate_per_hour: '',
    include_thr: false,
    notes: '',
    employee_ids: [] as number[],
  })
  const [itemForm, setItemForm] = useState({
    allowance_amount: '',
    deduction_amount: '',
    tax_amount: '',
    bpjs_amount: '',
    bonus_amount: '',
    thr_amount: '',
    notes: '',
  })

  const overviewQuery = useQuery({
    queryKey: ['payroll', 'overview'],
    queryFn: getPayrollOverview,
    enabled: canView,
  })

  const lookupsQuery = useQuery({
    queryKey: ['payroll', 'lookups'],
    queryFn: getPayrollLookups,
    enabled: canView,
  })

  const runsQuery = useQuery({
    queryKey: ['payroll', 'runs'],
    queryFn: getPayrollRuns,
    enabled: canView,
  })

  const selectedRunQuery = useQuery({
    queryKey: ['payroll', 'runs', selectedRunId],
    queryFn: () => getPayrollRun(selectedRunId as number),
    enabled: canView && selectedRunId !== null,
  })

  const approvalsQuery = useQuery({
    queryKey: ['payroll', 'approvals'],
    queryFn: getPayrollApprovals,
    enabled: canView,
  })

  const payslipsQuery = useQuery({
    queryKey: ['payroll', 'payslips'],
    queryFn: getPayrollPayslips,
    enabled: canView,
  })

  useEffect(() => {
    const defaults = lookupsQuery.data?.defaults
    const employees = lookupsQuery.data?.employees ?? []

    if (!defaults || generateForm.payroll_month) {
      return
    }

    setGenerateForm((current) => ({
      ...current,
      payroll_month: defaults.payroll_month,
      title: `Payroll ${formatMonth(defaults.payroll_month)}`,
      period_start: defaults.period_start,
      period_end: defaults.period_end,
      tax_rate: String(defaults.tax_rate),
      bpjs_health_rate: String(defaults.bpjs_health_rate),
      bpjs_employment_rate: String(defaults.bpjs_employment_rate),
      overtime_multiplier: String(defaults.overtime_multiplier),
      employee_ids: employees.map((employee) => employee.id),
    }))
  }, [generateForm.payroll_month, lookupsQuery.data])

  useEffect(() => {
    const runs = runsQuery.data ?? []

    if (runs.length === 0) {
      setSelectedRunId(null)
      return
    }

    if (selectedRunId === null || !runs.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(runs[0]?.id ?? null)
    }
  }, [runsQuery.data, selectedRunId])

  useEffect(() => {
    const items = selectedRunQuery.data?.items ?? []

    if (items.length === 0) {
      setSelectedItemId(null)
      return
    }

    if (selectedItemId === null || !items.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(items[0]?.id ?? null)
    }
  }, [selectedItemId, selectedRunQuery.data?.items])

  useEffect(() => {
    const item = selectedRunQuery.data?.items.find((candidate) => candidate.id === selectedItemId)

    if (!item) {
      return
    }

    setItemForm({
      allowance_amount: String(item.allowance_amount),
      deduction_amount: String(item.deduction_amount),
      tax_amount: String(item.tax_amount),
      bpjs_amount: String(item.bpjs_amount),
      bonus_amount: String(item.bonus_amount),
      thr_amount: String(item.thr_amount),
      notes: item.notes ?? '',
    })
  }, [selectedItemId, selectedRunQuery.data?.items])

  const invalidatePayroll = () => {
    void queryClient.invalidateQueries({ queryKey: ['payroll'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  const generateMutation = useMutation({
    mutationFn: generatePayrollRun,
    onSuccess: (run) => {
      setSelectedRunId(run.id)
      invalidatePayroll()
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ payrollItemId, payload }: { payrollItemId: number; payload: Parameters<typeof updatePayrollItem>[1] }) =>
      updatePayrollItem(payrollItemId, payload),
    onSuccess: () => {
      invalidatePayroll()
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ payrollRunId, remarks }: { payrollRunId: number; remarks?: string }) =>
      approvePayrollRun(payrollRunId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      invalidatePayroll()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ payrollRunId, remarks }: { payrollRunId: number; remarks: string }) =>
      rejectPayrollRun(payrollRunId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      invalidatePayroll()
    },
  })

  const selectedRun = selectedRunQuery.data ?? null
  const selectedItem = selectedRun?.items.find((item) => item.id === selectedItemId) ?? null
  const pendingApprovalRunIds = new Set((approvalsQuery.data ?? []).map((approval) => approval.payroll_run?.id).filter(Boolean))

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payroll access is unavailable</CardTitle>
          <CardDescription>
            Role ini belum memiliki permission `payroll.view`, jadi workspace payroll belum bisa ditampilkan.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    generateMutation.mutate({
      payroll_month: generateForm.payroll_month,
      title: generateForm.title,
      period_start: generateForm.period_start,
      period_end: generateForm.period_end,
      tax_rate: toNumber(generateForm.tax_rate),
      bpjs_health_rate: toNumber(generateForm.bpjs_health_rate),
      bpjs_employment_rate: toNumber(generateForm.bpjs_employment_rate),
      overtime_multiplier: toNumber(generateForm.overtime_multiplier),
      overtime_rate_per_hour: generateForm.overtime_rate_per_hour ? toNumber(generateForm.overtime_rate_per_hour) : undefined,
      include_thr: generateForm.include_thr,
      notes: generateForm.notes || undefined,
      employee_ids: generateForm.employee_ids,
    })
  }

  const handleSaveItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedItem) {
      return
    }

    updateItemMutation.mutate({
      payrollItemId: selectedItem.id,
      payload: {
        allowance_amount: toNumber(itemForm.allowance_amount),
        deduction_amount: toNumber(itemForm.deduction_amount),
        tax_amount: toNumber(itemForm.tax_amount),
        bpjs_amount: toNumber(itemForm.bpjs_amount),
        bonus_amount: toNumber(itemForm.bonus_amount),
        thr_amount: toNumber(itemForm.thr_amount),
        notes: itemForm.notes || undefined,
      },
    })
  }

  const toggleEmployee = (employeeId: number) => {
    setGenerateForm((current) => ({
      ...current,
      employee_ids: current.employee_ids.includes(employeeId)
        ? current.employee_ids.filter((id) => id !== employeeId)
        : [...current.employee_ids, employeeId],
    }))
  }

  const resetEmployeeSelection = (mode: 'all' | 'none') => {
    const employeeIds = mode === 'all'
      ? (lookupsQuery.data?.employees ?? []).map((employee) => employee.id)
      : []

    setGenerateForm((current) => ({
      ...current,
      employee_ids: employeeIds,
    }))
  }

  const handleDownload = async (key: string, download: () => Promise<void>) => {
    setDownloadKey(key)

    try {
      await download()
    } finally {
      setDownloadKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
        <Card className="hero-panel">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
                Payroll Enterprise
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <WalletCards className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
                Payroll Engine
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                Payroll yang rapi, approval yang jelas, dan payslip yang siap diunduh.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
                Workspace ini menyatukan basic salary, allowance, deduction, tax, BPJS, overtime,
                bonus, THR, approval, payroll history, dan export PDF/Excel dalam satu alur operasional.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Calculator}
                label="Runs"
                value={String(overviewQuery.data?.stats.runs_total ?? 0)}
              />
              <MetricCard
                icon={CheckCircle2}
                label="Approved"
                value={String(overviewQuery.data?.stats.approved_runs ?? 0)}
              />
              <MetricCard
                icon={ShieldCheck}
                label="Pending"
                value={String(overviewQuery.data?.stats.pending_approvals ?? 0)}
              />
              <MetricCard
                icon={BanknoteArrowDown}
                label="Current Net"
                value={formatCurrency(overviewQuery.data?.stats.current_month_net ?? 0)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Latest Run</p>
                <p className="mt-3 text-2xl font-bold text-white">
                  {overviewQuery.data?.latest_run?.title ?? 'No payroll run yet'}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {overviewQuery.data?.latest_run
                    ? `${overviewQuery.data.latest_run.payroll_month} • ${formatStatus(overviewQuery.data.latest_run.status)}`
                    : 'Generate payroll run pertama agar history dan approval mulai terbentuk.'}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Latest Payslip</p>
                <p className="mt-3 text-2xl font-bold text-white">
                  {overviewQuery.data?.latest_payslip
                    ? formatCurrency(overviewQuery.data.latest_payslip.net_amount, overviewQuery.data.latest_payslip.currency)
                    : 'No approved payslip yet'}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {overviewQuery.data?.latest_payslip?.employee
                    ? `${overviewQuery.data.latest_payslip.employee.full_name} • ${overviewQuery.data.latest_payslip.payroll_run?.payroll_month ?? 'Payroll'}`
                    : 'Approved payroll akan otomatis muncul di area self-service payslip.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="section-kicker">Self Service</span>
            <CardTitle className="pt-3 text-2xl">Payslip dan payroll history yang terlihat</CardTitle>
            <CardDescription>
              Employee hanya melihat payroll miliknya sendiri, sedangkan payroll, HR, auditor, dan super admin melihat konteks yang lebih luas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payslipsQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading payslips...</p>
            ) : null}

            {payslipsQuery.data?.slice(0, 3).map((payslip) => (
              <article className="data-row px-5 py-4" key={payslip.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{payslip.employee?.full_name ?? 'Employee'}</p>
                      <Badge variant="success">{payslip.payroll_run?.payroll_month ?? 'Approved'}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      Net pay {formatCurrency(payslip.net_amount, payslip.currency)}
                      {' • '}
                      Gross {formatCurrency(payslip.gross_amount, payslip.currency)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(`payslip-${payslip.id}`, () => downloadPayslipPdf(payslip.id))}
                    type="button"
                  >
                    <ReceiptText className="h-4 w-4" />
                    {downloadKey === `payslip-${payslip.id}` ? 'Downloading...' : 'Payslip PDF'}
                  </Button>
                </div>
              </article>
            ))}

            {!payslipsQuery.isLoading && (payslipsQuery.data?.length ?? 0) === 0 ? (
              <EmptyState text="Belum ada payslip approved yang terlihat oleh akun ini." />
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        {canManage ? (
          <Card>
            <CardHeader>
              <span className="section-kicker">Generate Run</span>
              <CardTitle className="pt-3 text-2xl">Bangun payroll period baru</CardTitle>
              <CardDescription>
                Formula default diambil dari salary history dan overtime attendance, lalu bisa disesuaikan sebelum final approval.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleGenerate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Payroll Month">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, payroll_month: event.currentTarget.value }))}
                      type="month"
                      value={generateForm.payroll_month}
                    />
                  </Field>
                  <Field label="Title">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, title: event.currentTarget.value }))}
                      placeholder="Payroll July 2026"
                      value={generateForm.title}
                    />
                  </Field>
                  <Field label="Period Start">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, period_start: event.currentTarget.value }))}
                      type="date"
                      value={generateForm.period_start}
                    />
                  </Field>
                  <Field label="Period End">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, period_end: event.currentTarget.value }))}
                      type="date"
                      value={generateForm.period_end}
                    />
                  </Field>
                  <Field label="Tax Rate">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, tax_rate: event.currentTarget.value }))}
                      placeholder="0.05"
                      step="0.0001"
                      type="number"
                      value={generateForm.tax_rate}
                    />
                  </Field>
                  <Field label="BPJS Health Rate">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, bpjs_health_rate: event.currentTarget.value }))}
                      placeholder="0.01"
                      step="0.0001"
                      type="number"
                      value={generateForm.bpjs_health_rate}
                    />
                  </Field>
                  <Field label="BPJS Employment Rate">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, bpjs_employment_rate: event.currentTarget.value }))}
                      placeholder="0.02"
                      step="0.0001"
                      type="number"
                      value={generateForm.bpjs_employment_rate}
                    />
                  </Field>
                  <Field label="Overtime Multiplier">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, overtime_multiplier: event.currentTarget.value }))}
                      placeholder="1"
                      step="0.01"
                      type="number"
                      value={generateForm.overtime_multiplier}
                    />
                  </Field>
                  <Field label="Overtime Rate per Hour">
                    <Input
                      onChange={(event) => setGenerateForm((current) => ({ ...current, overtime_rate_per_hour: event.currentTarget.value }))}
                      placeholder="Optional override"
                      step="0.01"
                      type="number"
                      value={generateForm.overtime_rate_per_hour}
                    />
                  </Field>
                </div>

                <div className="rounded-[24px] border border-app-border bg-app-background/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">Employee selection</p>
                      <p className="text-sm text-app-muted-foreground">
                        Pilih employee yang ikut payroll run ini.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => resetEmployeeSelection('all')} size="sm" type="button" variant="secondary">
                        Select All
                      </Button>
                      <Button onClick={() => resetEmployeeSelection('none')} size="sm" type="button" variant="secondary">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {lookupsQuery.data?.employees.map((employee) => (
                      <label
                        className="flex cursor-pointer items-start gap-3 rounded-[20px] border border-app-border bg-white/72 px-4 py-3"
                        key={employee.id}
                      >
                        <input
                          checked={generateForm.employee_ids.includes(employee.id)}
                          className="mt-1 h-4 w-4"
                          onChange={() => toggleEmployee(employee.id)}
                          type="checkbox"
                        />
                        <div>
                          <p className="font-medium">{employee.full_name}</p>
                          <p className="text-sm text-app-muted-foreground">
                            {employee.employee_number}
                            {' • '}
                            {employee.department ?? 'No department'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-3 rounded-[20px] border border-app-border bg-white/72 px-4 py-3 text-sm font-medium">
                  <input
                    checked={generateForm.include_thr}
                    className="h-4 w-4"
                    onChange={(event) => setGenerateForm((current) => ({ ...current, include_thr: event.currentTarget.checked }))}
                    type="checkbox"
                  />
                  Include THR automatically based on basic salary plus allowance.
                </label>

                <Field label="Notes">
                  <textarea
                    className="min-h-[104px] w-full rounded-[20px] border border-app-border bg-white/86 px-4 py-3 text-sm text-app-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_12px_24px_-22px_rgba(16,24,40,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(185,123,49,0.28)]"
                    onChange={(event) => setGenerateForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                    placeholder="Optional context for this payroll batch."
                    value={generateForm.notes}
                  />
                </Field>

                {generateMutation.isError ? (
                  <p className="text-sm text-red-700">{getErrorMessage(generateMutation.error)}</p>
                ) : null}

                <Button disabled={generateMutation.isPending || generateForm.employee_ids.length === 0} size="lg" type="submit">
                  <Send className="h-4 w-4" />
                  {generateMutation.isPending ? 'Generating payroll...' : 'Generate Payroll Run'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <span className="section-kicker">Run History</span>
            <CardTitle className="pt-3 text-2xl">Payroll batch yang terlihat</CardTitle>
            <CardDescription>
              Pilih run untuk melihat item per employee, jalur approval, dan ringkasan gross/net.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {runsQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading payroll runs...</p>
            ) : null}

            {runsQuery.data?.map((run) => (
              <button
                className={[
                  'data-row w-full px-5 py-4 text-left transition',
                  selectedRunId === run.id ? 'border-[rgba(185,123,49,0.28)] bg-app-background/70' : '',
                ].join(' ')}
                key={run.id}
                onClick={() => setSelectedRunId(run.id)}
                type="button"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{run.title}</p>
                      <Badge variant={payrollStatusVariantMap[run.status as keyof typeof payrollStatusVariantMap] ?? 'neutral'}>
                        {formatStatus(run.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {run.payroll_month}
                      {' • '}
                      {formatDate(run.period_start)}
                      {' - '}
                      {formatDate(run.period_end)}
                      {' • '}
                      {run.items_count} employee(s)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-app-foreground">
                      {formatCurrency(run.summary?.net_total ?? 0)}
                    </p>
                    <p className="text-xs text-app-muted-foreground">Net total</p>
                  </div>
                </div>
              </button>
            ))}

            {!runsQuery.isLoading && (runsQuery.data?.length ?? 0) === 0 ? (
              <EmptyState text="Belum ada payroll run. Generate batch pertama dari panel sebelah." />
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-kicker">Run Detail</span>
              <CardTitle className="pt-3 text-2xl">
                {selectedRun?.title ?? 'Select a payroll run'}
              </CardTitle>
              <CardDescription>
                {selectedRun
                  ? `Period ${formatDate(selectedRun.period_start)} sampai ${formatDate(selectedRun.period_end)}.`
                  : 'Pilih payroll run untuk membuka employee items dan export.'}
              </CardDescription>
            </div>
            {selectedRun ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleDownload(`run-pdf-${selectedRun.id}`, () => downloadPayrollRunPdf(selectedRun.id))}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <FileDown className="h-4 w-4" />
                  {downloadKey === `run-pdf-${selectedRun.id}` ? 'Downloading...' : 'Export PDF'}
                </Button>
                <Button
                  onClick={() => handleDownload(`run-xls-${selectedRun.id}`, () => downloadPayrollRunExcel(selectedRun.id))}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {downloadKey === `run-xls-${selectedRun.id}` ? 'Downloading...' : 'Export Excel'}
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedRunQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading payroll detail...</p>
            ) : null}

            {selectedRun ? (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SummaryPill label="Gross Total" value={formatCurrency(selectedRun.summary?.gross_total ?? 0)} />
                  <SummaryPill label="Net Total" value={formatCurrency(selectedRun.summary?.net_total ?? 0)} />
                  <SummaryPill label="Overtime" value={formatCurrency(selectedRun.summary?.overtime_total ?? 0)} />
                  <SummaryPill label="THR" value={formatCurrency(selectedRun.summary?.thr_total ?? 0)} />
                </div>

                <div className="rounded-[24px] border border-app-border bg-app-background/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={payrollStatusVariantMap[selectedRun.status as keyof typeof payrollStatusVariantMap] ?? 'neutral'}>
                      {formatStatus(selectedRun.status)}
                    </Badge>
                    {selectedRun.include_thr ? <Badge variant="success">THR Included</Badge> : null}
                    {pendingApprovalRunIds.has(selectedRun.id) ? <Badge variant="warning">Needs your approval</Badge> : null}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <DetailPair label="Submitter" value={selectedRun.submitter?.name ?? 'N/A'} />
                    <DetailPair label="Reviewer" value={selectedRun.reviewer?.name ?? 'Pending'} />
                    <DetailPair label="Tax Rate" value={formatRate(selectedRun.tax_rate)} />
                    <DetailPair label="BPJS Total Rate" value={formatRate(selectedRun.bpjs_health_rate + selectedRun.bpjs_employment_rate)} />
                  </div>
                  {selectedRun.notes ? (
                    <p className="mt-4 text-sm leading-7 text-app-muted-foreground">{selectedRun.notes}</p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {selectedRun.items.map((item) => (
                    <button
                      className={[
                        'data-row w-full px-5 py-4 text-left transition',
                        selectedItemId === item.id ? 'border-[rgba(185,123,49,0.28)] bg-app-background/70' : '',
                      ].join(' ')}
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      type="button"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold">{item.employee?.full_name ?? 'Employee'}</p>
                          <p className="mt-2 text-sm text-app-muted-foreground">
                            {item.employee?.employee_number ?? 'N/A'}
                            {' • '}
                            {item.employee?.department ?? 'No department'}
                            {' • '}
                            {formatMinutes(item.overtime_minutes)} overtime
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(item.net_amount, item.currency)}</p>
                          <p className="text-xs text-app-muted-foreground">Net pay</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedRun.approvals.length > 0 ? (
                  <div className="rounded-[24px] border border-app-border bg-app-background/55 p-4">
                    <p className="font-semibold">Approval chain</p>
                    <div className="mt-3 space-y-3">
                      {selectedRun.approvals.map((approval) => (
                        <div className="flex flex-col gap-2 rounded-[18px] border border-app-border bg-white/72 px-4 py-3 md:flex-row md:items-center md:justify-between" key={approval.id}>
                          <div>
                            <p className="font-medium">
                              {approval.approver?.name ?? 'Approver'}
                              {' • '}
                              {approval.stage}
                            </p>
                            <p className="text-sm text-app-muted-foreground">
                              {approval.remarks ?? 'No remarks yet.'}
                            </p>
                          </div>
                          <Badge variant={approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'danger' : 'warning'}>
                            {formatStatus(approval.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <EmptyState text="Pilih payroll run dari daftar untuk membuka ringkasan dan item detail." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <span className="section-kicker">Approvals</span>
              <CardTitle className="pt-3 text-2xl">Inbox approval payroll</CardTitle>
              <CardDescription>
                Run yang memang menunggu aksi dari akun saat ini akan muncul di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {approvalsQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading approval inbox...</p>
              ) : null}

              {approvalsQuery.data?.map((approval) => {
                const payrollRun = approval.payroll_run
                const approvalNote = approvalNotes[approval.id] ?? ''

                return (
                  <article className="data-row px-5 py-4" key={approval.id}>
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{payrollRun?.title ?? 'Payroll run'}</p>
                          <Badge variant="warning">{approval.stage}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-app-muted-foreground">
                          {payrollRun?.payroll_month ?? 'Payroll'}
                          {' • '}
                          Status {formatStatus(payrollRun?.status ?? approval.status)}
                        </p>
                      </div>

                      {canManage ? (
                        <>
                          <textarea
                            className="min-h-[88px] w-full rounded-[20px] border border-app-border bg-white/86 px-4 py-3 text-sm text-app-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_12px_24px_-22px_rgba(16,24,40,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(185,123,49,0.28)]"
                            onChange={(event) => setApprovalNotes((current) => ({ ...current, [approval.id]: event.currentTarget.value }))}
                            placeholder="Optional remarks for payroll approval or rejection."
                            value={approvalNote}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              disabled={approveMutation.isPending}
                              onClick={() => {
                                if (!payrollRun) {
                                  return
                                }

                                approveMutation.mutate({
                                  payrollRunId: payrollRun.id,
                                  remarks: approvalNote || undefined,
                                })
                              }}
                              size="sm"
                              type="button"
                            >
                              Approve
                            </Button>
                            <Button
                              disabled={rejectMutation.isPending || approvalNote.trim().length < 5}
                              onClick={() => {
                                if (!payrollRun) {
                                  return
                                }

                                rejectMutation.mutate({
                                  payrollRunId: payrollRun.id,
                                  remarks: approvalNote,
                                })
                              }}
                              size="sm"
                              type="button"
                              variant="danger"
                            >
                              Reject
                            </Button>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </article>
                )
              })}

              {!approvalsQuery.isLoading && (approvalsQuery.data?.length ?? 0) === 0 ? (
                <EmptyState text="Tidak ada payroll approval yang menunggu aksi saat ini." />
              ) : null}

              {approveMutation.isError ? (
                <p className="text-sm text-red-700">{getErrorMessage(approveMutation.error)}</p>
              ) : null}

              {rejectMutation.isError ? (
                <p className="text-sm text-red-700">{getErrorMessage(rejectMutation.error)}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="section-kicker">Item Review</span>
              <CardTitle className="pt-3 text-2xl">Adjustment payroll item</CardTitle>
              <CardDescription>
                Allowance, deduction, tax, BPJS, bonus, dan THR bisa dikoreksi sebelum run disetujui final.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItem ? (
                <>
                  <div className="rounded-[24px] border border-app-border bg-app-background/60 px-5 py-4">
                    <p className="font-semibold">{selectedItem.employee?.full_name ?? 'Employee'}</p>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {selectedItem.employee?.employee_number ?? 'N/A'}
                      {' • '}
                      {selectedItem.employee?.position ?? 'No position'}
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <DetailPair label="Basic Salary" value={formatCurrency(selectedItem.basic_salary, selectedItem.currency)} />
                      <DetailPair label="Net Pay" value={formatCurrency(selectedItem.net_amount, selectedItem.currency)} />
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleSaveItem}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Allowance">
                        <Input
                          disabled={!canManage || selectedRun?.status === 'approved'}
                          onChange={(event) => setItemForm((current) => ({ ...current, allowance_amount: event.currentTarget.value }))}
                          step="0.01"
                          type="number"
                          value={itemForm.allowance_amount}
                        />
                      </Field>
                      <Field label="Deduction">
                        <Input
                          disabled={!canManage || selectedRun?.status === 'approved'}
                          onChange={(event) => setItemForm((current) => ({ ...current, deduction_amount: event.currentTarget.value }))}
                          step="0.01"
                          type="number"
                          value={itemForm.deduction_amount}
                        />
                      </Field>
                      <Field label="Tax">
                        <Input
                          disabled={!canManage || selectedRun?.status === 'approved'}
                          onChange={(event) => setItemForm((current) => ({ ...current, tax_amount: event.currentTarget.value }))}
                          step="0.01"
                          type="number"
                          value={itemForm.tax_amount}
                        />
                      </Field>
                      <Field label="BPJS">
                        <Input
                          disabled={!canManage || selectedRun?.status === 'approved'}
                          onChange={(event) => setItemForm((current) => ({ ...current, bpjs_amount: event.currentTarget.value }))}
                          step="0.01"
                          type="number"
                          value={itemForm.bpjs_amount}
                        />
                      </Field>
                      <Field label="Bonus">
                        <Input
                          disabled={!canManage || selectedRun?.status === 'approved'}
                          onChange={(event) => setItemForm((current) => ({ ...current, bonus_amount: event.currentTarget.value }))}
                          step="0.01"
                          type="number"
                          value={itemForm.bonus_amount}
                        />
                      </Field>
                      <Field label="THR">
                        <Input
                          disabled={!canManage || selectedRun?.status === 'approved'}
                          onChange={(event) => setItemForm((current) => ({ ...current, thr_amount: event.currentTarget.value }))}
                          step="0.01"
                          type="number"
                          value={itemForm.thr_amount}
                        />
                      </Field>
                    </div>

                    <Field label="Notes">
                      <textarea
                        className="min-h-[96px] w-full rounded-[20px] border border-app-border bg-white/86 px-4 py-3 text-sm text-app-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.84),0_12px_24px_-22px_rgba(16,24,40,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(185,123,49,0.28)]"
                        disabled={!canManage || selectedRun?.status === 'approved'}
                        onChange={(event) => setItemForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                        placeholder="Optional item-level note."
                        value={itemForm.notes}
                      />
                    </Field>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        disabled={!canManage || selectedRun?.status === 'approved' || updateItemMutation.isPending}
                        type="submit"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {updateItemMutation.isPending ? 'Saving...' : 'Save Adjustment'}
                      </Button>
                      <Button
                        onClick={() => handleDownload(`item-pdf-${selectedItem.id}`, () => downloadPayslipPdf(selectedItem.id))}
                        type="button"
                        variant="secondary"
                      >
                        <ReceiptText className="h-4 w-4" />
                        {downloadKey === `item-pdf-${selectedItem.id}` ? 'Downloading...' : 'Payslip PDF'}
                      </Button>
                    </div>

                    {updateItemMutation.isError ? (
                      <p className="text-sm text-red-700">{getErrorMessage(updateItemMutation.error)}</p>
                    ) : null}
                  </form>
                </>
              ) : (
                <EmptyState text="Pilih payroll item dari run detail untuk melihat breakdown dan adjustment." />
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof WalletCards
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">{label}</p>
        <Icon className="h-4 w-4 text-[color:var(--app-highlight)]" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">{value}</p>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-app-border bg-white/72 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold tracking-[-0.03em] text-app-foreground">{value}</p>
    </div>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function DetailPair({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-black/4 px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-app-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-app-foreground">{value}</p>
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

function toNumber(value: string) {
  return Number(value || '0')
}

function formatCurrency(value: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}-01`))
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function formatRate(value: number) {
  return `${(value * 100).toFixed(2)}%`
}

function formatMinutes(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = value % 60

  if (hours === 0) {
    return `${minutes} min`
  }

  return `${hours}h ${minutes}m`
}
