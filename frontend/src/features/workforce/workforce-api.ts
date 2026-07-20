import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  AuditLog,
  Department,
  Employee,
  EmployeeLookups,
  PaginationMeta,
} from '@/types/api'

export interface EmployeesResponse {
  items: Employee[]
  meta: PaginationMeta | undefined
}

export interface EmployeeAuditLogsResponse {
  items: AuditLog[]
  meta: PaginationMeta | undefined
}

export interface EmployeeMutationPayload {
  employee_number: string
  first_name: string
  middle_name?: string
  last_name: string
  preferred_name?: string
  work_email: string
  personal_email?: string
  phone?: string
  gender?: string
  marital_status?: string
  place_of_birth?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  identity_card_number?: string
  passport_number?: string
  passport_expiry_date?: string
  npwp_number?: string
  bpjs_health_number?: string
  bpjs_employment_number?: string
  job_title: string
  employment_type: string
  employment_status: string
  department_id: number
  branch_id?: number
  team_id?: number
  division_id?: number
  position_id?: number
  manager_id?: number
  user_id?: number
  hire_date: string
  birth_date?: string
  family: Array<Record<string, unknown>>
  emergency_contacts: Array<Record<string, unknown>>
  educations: Array<Record<string, unknown>>
  experiences: Array<Record<string, unknown>>
  skills: Array<Record<string, unknown>>
  certifications: Array<Record<string, unknown>>
  bank_accounts: Array<Record<string, unknown>>
  salary_histories: Array<Record<string, unknown>>
  contracts: Array<Record<string, unknown>>
  meta?: Record<string, unknown>
}

export interface UploadEmployeeDocumentPayload {
  category: string
  label: string
  file: File
  issued_at?: string
  expires_at?: string
  notes?: string
}

export async function getEmployees(search?: string) {
  const { data } = await http.get<ApiEnvelope<Employee[]>>('/employees', {
    params: search ? { search } : undefined,
  })

  return {
    items: data.data,
    meta: data.meta,
  } satisfies EmployeesResponse
}

export async function getDepartments() {
  const { data } = await http.get<ApiEnvelope<Department[]>>('/departments')
  return data.data
}

export async function getEmployeeLookups() {
  const { data } = await http.get<ApiEnvelope<EmployeeLookups>>('/employees/lookups')
  return data.data
}

export async function getEmployee(employeeId: number) {
  const { data } = await http.get<ApiEnvelope<Employee>>(`/employees/${employeeId}`)
  return data.data
}

export async function createEmployee(payload: EmployeeMutationPayload) {
  const { data } = await http.post<ApiEnvelope<Employee>>('/employees', payload)
  return data.data
}

export async function updateEmployee(employeeId: number, payload: EmployeeMutationPayload) {
  const { data } = await http.put<ApiEnvelope<Employee>>(`/employees/${employeeId}`, payload)
  return data.data
}

export async function getEmployeeAuditLogs(employeeId: number) {
  const { data } = await http.get<ApiEnvelope<AuditLog[]>>(`/employees/${employeeId}/audit-logs`)

  return {
    items: data.data,
    meta: data.meta,
  } satisfies EmployeeAuditLogsResponse
}

export async function uploadEmployeeDocument(
  employeeId: number,
  payload: UploadEmployeeDocumentPayload,
) {
  const formData = new FormData()
  formData.append('category', payload.category)
  formData.append('label', payload.label)
  formData.append('file', payload.file)

  if (payload.issued_at) {
    formData.append('issued_at', payload.issued_at)
  }

  if (payload.expires_at) {
    formData.append('expires_at', payload.expires_at)
  }

  if (payload.notes) {
    formData.append('notes', payload.notes)
  }

  const { data } = await http.post<ApiEnvelope<Employee>>(
    `/employees/${employeeId}/documents`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function deleteEmployeeDocument(employeeId: number, documentId: number) {
  const { data } = await http.delete<ApiEnvelope<Employee>>(
    `/employees/${employeeId}/documents/${documentId}`,
  )

  return data.data
}
