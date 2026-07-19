export interface ApiEnvelope<T> {
  message: string
  data: T
  meta?: PaginationMeta
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AuthenticatedEmployee {
  id: number
  employee_number: string
  full_name: string
  job_title: string
  department: string | null
}

export interface AuthenticatedUser {
  id: number
  name: string
  email: string
  status: string
  last_login_at: string | null
  roles: string[]
  permissions: string[]
  employee: AuthenticatedEmployee | null
}

export interface AuthSession {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthenticatedUser
}

export interface Department {
  id: number
  name: string
  code: string
  description: string | null
  cost_center: string | null
}

export interface Team {
  id: number
  name: string
  code: string
  description: string | null
  employees_count: number
  department: Pick<Department, 'id' | 'name' | 'code'> | null
  lead: {
    id: number
    employee_number: string
    full_name: string
  } | null
}

export interface OrganizationUnit extends Department {
  employees_count: number
  teams_count: number
  teams: Team[]
}

export interface Employee {
  id: number
  employee_number: string
  first_name: string
  last_name: string
  full_name: string
  work_email: string
  personal_email: string | null
  phone: string | null
  job_title: string
  employment_type: string
  employment_status: string
  hire_date: string
  birth_date: string | null
  department: Pick<Department, 'id' | 'name' | 'code'> | null
  team: Pick<Team, 'id' | 'name' | 'code'> | null
  manager: {
    id: number
    employee_number: string
    full_name: string
  } | null
  user: {
    id: number
    name: string
    email: string
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
  metrics: {
    total_employees: number
    active_employees: number
    total_departments: number
    new_hires_this_month: number
  }
  recent_hires: Employee[]
}

export interface LeaveType {
  id: number
  code: string
  name: string
  description: string | null
  default_days: number
  requires_attachment: boolean
  is_active: boolean
}

export interface LeaveApprovalStep {
  id: number
  stage: string
  status: string
  acted_at: string | null
  remarks: string | null
  approver: {
    id: number
    name: string
    email: string
  } | null
}

export interface LeaveRequest {
  id: number
  status: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  submitted_at: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  leave_type: Pick<LeaveType, 'id' | 'code' | 'name'> | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
    team: string | null
  } | null
  reviewer: {
    id: number
    name: string
    email: string
  } | null
  approvals: LeaveApprovalStep[]
  meta: Record<string, unknown> | null
}

export interface ApprovalInboxItem {
  id: number
  stage: string
  status: string
  acted_at: string | null
  remarks: string | null
  approver: {
    id: number
    name: string
    email: string
  } | null
  leave_request: {
    id: number
    status: string
    start_date: string
    end_date: string
    reason: string
    leave_type: Pick<LeaveType, 'id' | 'code' | 'name'> | null
    employee: {
      id: number
      employee_number: string
      full_name: string
      department: string | null
      team: string | null
    } | null
  } | null
}

export interface AuditLog {
  id: number
  action: string
  summary: string
  ip_address: string | null
  created_at: string
  actor: {
    id: number
    name: string
    email: string
  } | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
}
