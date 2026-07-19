import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  Department,
  Employee,
  PaginationMeta,
} from '@/types/api'

export interface EmployeesResponse {
  items: Employee[]
  meta: PaginationMeta | undefined
}

export interface CreateEmployeePayload {
  employee_number: string
  first_name: string
  last_name: string
  work_email: string
  personal_email?: string
  phone?: string
  job_title: string
  employment_type: string
  employment_status: string
  department_id: number
  team_id?: number
  hire_date: string
  birth_date?: string
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

export async function createEmployee(payload: CreateEmployeePayload) {
  const { data } = await http.post<ApiEnvelope<Employee>>('/employees', payload)
  return data.data
}
