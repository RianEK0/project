import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  PayrollItem,
  PayrollLookups,
  PayrollOverview,
  PayrollRun,
  PayrollRunApproval,
} from '@/types/api'

export interface GeneratePayrollRunPayload {
  payroll_month: string
  title: string
  period_start: string
  period_end: string
  tax_rate: number
  bpjs_health_rate: number
  bpjs_employment_rate: number
  overtime_multiplier: number
  overtime_rate_per_hour?: number
  include_thr?: boolean
  notes?: string
  employee_ids?: number[]
}

export interface UpdatePayrollItemPayload {
  allowance_amount?: number
  deduction_amount?: number
  tax_amount?: number
  bpjs_amount?: number
  bonus_amount?: number
  thr_amount?: number
  notes?: string
}

export async function getPayrollOverview() {
  const { data } = await http.get<ApiEnvelope<PayrollOverview>>('/payroll/overview')
  return data.data
}

export async function getPayrollLookups() {
  const { data } = await http.get<ApiEnvelope<PayrollLookups>>('/payroll/lookups')
  return data.data
}

export async function getPayrollRuns() {
  const { data } = await http.get<ApiEnvelope<PayrollRun[]>>('/payroll/runs')
  return data.data
}

export async function getPayrollRun(payrollRunId: number) {
  const { data } = await http.get<ApiEnvelope<PayrollRun>>(`/payroll/runs/${payrollRunId}`)
  return data.data
}

export async function getPayrollApprovals() {
  const { data } = await http.get<ApiEnvelope<PayrollRunApproval[]>>('/payroll/approvals')
  return data.data
}

export async function getPayrollPayslips() {
  const { data } = await http.get<ApiEnvelope<PayrollItem[]>>('/payroll/payslips')
  return data.data
}

export async function generatePayrollRun(payload: GeneratePayrollRunPayload) {
  const { data } = await http.post<ApiEnvelope<PayrollRun>>('/payroll/runs', payload)
  return data.data
}

export async function updatePayrollItem(payrollItemId: number, payload: UpdatePayrollItemPayload) {
  const { data } = await http.put<ApiEnvelope<PayrollItem>>(`/payroll/items/${payrollItemId}`, payload)
  return data.data
}

export async function approvePayrollRun(payrollRunId: number, remarks?: string) {
  const { data } = await http.post<ApiEnvelope<PayrollRun>>(
    `/payroll/runs/${payrollRunId}/approve`,
    remarks ? { remarks } : {},
  )

  return data.data
}

export async function rejectPayrollRun(payrollRunId: number, remarks: string) {
  const { data } = await http.post<ApiEnvelope<PayrollRun>>(
    `/payroll/runs/${payrollRunId}/reject`,
    { remarks },
  )

  return data.data
}

export async function downloadPayrollRunPdf(payrollRunId: number) {
  await downloadBlob(`/payroll/runs/${payrollRunId}/export/pdf`, `payroll-run-${payrollRunId}.pdf`)
}

export async function downloadPayrollRunExcel(payrollRunId: number) {
  await downloadBlob(`/payroll/runs/${payrollRunId}/export/excel`, `payroll-run-${payrollRunId}.xls`)
}

export async function downloadPayslipPdf(payrollItemId: number) {
  await downloadBlob(`/payroll/payslips/${payrollItemId}/pdf`, `payslip-${payrollItemId}.pdf`)
}

async function downloadBlob(path: string, fallbackFilename: string) {
  const response = await http.get(path, {
    responseType: 'blob',
  })
  const contentType = typeof response.headers['content-type'] === 'string'
    ? response.headers['content-type']
    : 'application/octet-stream'
  const contentDisposition = typeof response.headers['content-disposition'] === 'string'
    ? response.headers['content-disposition']
    : undefined

  const blob = response.data instanceof Blob
    ? response.data
    : new Blob([response.data], {
      type: contentType,
    })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = parseFilename(contentDisposition) ?? fallbackFilename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(url)
}

function parseFilename(contentDisposition?: string) {
  if (!contentDisposition) {
    return null
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/)
  return match?.[1] ?? null
}
