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
  email_verified_at: string | null
  two_factor_enabled: boolean
  last_login_at: string | null
  password_changed_at: string | null
  roles: string[]
  permissions: string[]
  employee: AuthenticatedEmployee | null
}

export interface AuthDeviceSession {
  id: string
  device_name: string | null
  ip_address: string | null
  user_agent: string | null
  remember: boolean
  last_seen_at: string | null
  last_refreshed_at: string | null
  expires_at: string
  revoked_at: string | null
  is_current: boolean
  created_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  refresh_expires_at: string
  remember: boolean
  user: AuthenticatedUser
  session: AuthDeviceSession
}

export interface TwoFactorChallenge {
  requires_two_factor: true
  challenge_id: string
  recovery_code_allowed: boolean
}

export interface CaptchaChallenge {
  captcha_id: string
  image: string
  expires_at: string
  test_answer?: string
}

export interface LoginHistoryEntry {
  id: number
  email: string
  successful: boolean
  two_factor_passed: boolean
  failure_reason: string | null
  device_name: string | null
  ip_address: string | null
  user_agent: string | null
  attempted_at: string
}

export interface TwoFactorSetup {
  secret: string
  otpauth_uri: string
  expires_at: string
}

export interface AccessControlPermission {
  id: number
  code: string
  label: string
  group: string
  description: string | null
}

export interface AccessControlRole {
  id: number
  name: string
  label: string
  description: string | null
  users_count: number
  is_locked: boolean
  permissions: AccessControlPermission[]
}

export interface AccessControlUserRole {
  id: number
  name: string
  label: string
}

export interface AccessControlUser {
  id: number
  name: string
  email: string
  status: string
  last_login_at: string | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  roles: AccessControlUserRole[]
}

export interface AccessControlOverview {
  can_manage_roles: boolean
  can_manage_users: boolean
  roles: AccessControlRole[]
  permissions: AccessControlPermission[]
  users: AccessControlUser[]
}

export interface Department {
  id: number
  name: string
  code: string
  description: string | null
  cost_center: string | null
}

export interface Branch {
  id: number
  name: string
  code: string
  address: string | null
  phone: string | null
  is_active: boolean
  company?: {
    id: number
    name: string
    code: string
  } | null
}

export interface Division {
  id: number
  name: string
  code: string
  description: string | null
  department: Pick<Department, 'id' | 'name' | 'code'> | null
}

export interface Section {
  id: number
  name: string
  code: string
  description: string | null
  division: Pick<Division, 'id' | 'name' | 'code'> | null
}

export interface Position {
  id: number
  name: string
  code: string
  grade: string | null
  description: string | null
  division: Pick<Division, 'id' | 'name' | 'code'> | null
  section?: Pick<Section, 'id' | 'name' | 'code'> | null
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
  employee_code: string
  first_name: string
  middle_name: string | null
  last_name: string
  preferred_name: string | null
  full_name: string
  work_email: string
  personal_email: string | null
  phone: string | null
  gender: string | null
  marital_status: string | null
  place_of_birth: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  photo_url: string | null
  identity_card_number: string | null
  passport_number: string | null
  passport_expiry_date: string | null
  npwp_number: string | null
  bpjs_health_number: string | null
  bpjs_employment_number: string | null
  job_title: string
  employment_type: string
  employment_status: string
  hire_date: string
  birth_date: string | null
  branch: Pick<Branch, 'id' | 'name' | 'code'> | null
  department: Pick<Department, 'id' | 'name' | 'code'> | null
  division: Pick<Division, 'id' | 'name' | 'code'> | null
  section: Pick<Section, 'id' | 'name' | 'code'> | null
  position: Pick<Position, 'id' | 'name' | 'code' | 'grade'> | null
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
  family: EmployeeFamilyMember[]
  emergency_contacts: EmployeeEmergencyContact[]
  educations: EmployeeEducation[]
  experiences: EmployeeExperience[]
  skills: EmployeeSkill[]
  certifications: EmployeeCertification[]
  bank_accounts: EmployeeBankAccount[]
  salary_histories: EmployeeSalaryHistory[]
  contracts: EmployeeContract[]
  documents: EmployeeDocument[]
  history: EmployeeHistoryEntry[]
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface EmployeeFamilyMember {
  name: string
  relationship: string
  birth_date?: string | null
  occupation?: string | null
  dependent?: boolean
}

export interface EmployeeEmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string | null
  address?: string | null
}

export interface EmployeeEducation {
  institution: string
  degree: string
  major?: string | null
  start_year?: number | null
  end_year?: number | null
  gpa?: number | null
}

export interface EmployeeExperience {
  company: string
  position: string
  start_date: string
  end_date?: string | null
  description?: string | null
}

export interface EmployeeSkill {
  name: string
  category?: string | null
  level?: string | null
  notes?: string | null
}

export interface EmployeeCertification {
  name: string
  issuer?: string | null
  credential_id?: string | null
  issued_at?: string | null
  expires_at?: string | null
}

export interface EmployeeBankAccount {
  bank_name: string
  account_name: string
  account_number: string
  branch?: string | null
  is_primary?: boolean
}

export interface EmployeeSalaryHistory {
  id: number
  component: string
  amount: number
  currency: string
  pay_frequency: string
  effective_date: string
  end_date: string | null
  is_current: boolean
  notes: string | null
  meta: Record<string, unknown> | null
}

export interface EmployeeContract {
  id: number
  contract_type: string
  contract_number: string | null
  start_date: string
  end_date: string | null
  status: string
  terms: string | null
  notes: string | null
  meta: Record<string, unknown> | null
}

export interface EmployeeDocument {
  id: number
  category: string
  label: string
  file_name: string
  file_url: string
  mime_type: string | null
  file_size: number | null
  issued_at: string | null
  expires_at: string | null
  notes: string | null
  uploaded_by: {
    id: number
    name: string
    email: string
  } | null
  created_at: string
}

export interface EmployeeHistoryEntry {
  type: string
  title: string
  description: string
  date: string
}

export interface EmployeeLookupOption {
  value: string
  label: string
}

export interface EmployeeLookupManager {
  id: number
  employee_number: string
  full_name: string
  job_title: string
}

export interface EmployeeLookups {
  departments: Department[]
  teams: Team[]
  branches: Branch[]
  divisions: Division[]
  sections?: Section[]
  positions: Position[]
  managers: EmployeeLookupManager[]
  employment_types: EmployeeLookupOption[]
  employment_statuses: EmployeeLookupOption[]
}

export interface Company {
  id: number
  name: string
  code: string
  legal_name: string | null
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  description: string | null
}

export interface OrganizationEmployeeReference {
  id: number
  employee_number: string
  full_name: string
  job_title: string
  work_email: string
}

export interface OrganizationPositionNode {
  id: number
  name: string
  code: string
  grade: string | null
  description: string | null
  headcount: number
  employees: OrganizationEmployeeReference[]
}

export interface OrganizationSectionNode {
  id: number | null
  name: string | null
  code: string | null
  description: string | null
  headcount: number
  manager: OrganizationEmployeeReference | null
  positions: OrganizationPositionNode[]
}

export interface OrganizationDivisionNode {
  id: number | null
  name: string | null
  code: string | null
  description: string | null
  headcount: number
  manager: OrganizationEmployeeReference | null
  sections: OrganizationSectionNode[]
  positions: OrganizationPositionNode[]
}

export interface OrganizationDepartmentNode {
  id: number | null
  name: string | null
  code: string | null
  cost_center: string | null
  description: string | null
  headcount: number
  manager: OrganizationEmployeeReference | null
  divisions: OrganizationDivisionNode[]
}

export interface OrganizationBranchNode {
  id: number
  name: string
  code: string
  address: string | null
  phone: string | null
  is_active: boolean
  headcount: number
  manager: OrganizationEmployeeReference | null
  departments: OrganizationDepartmentNode[]
}

export interface OrganizationCompanyNode extends Company {
  headcount: number
  branches: OrganizationBranchNode[]
}

export interface OrganizationChartNode {
  id: number
  employee_number: string
  name: string
  title: string
  branch: string | null
  department: string | null
  division: string | null
  section: string | null
  position: string | null
  manager_id: number | null
  reports_count: number
  children: OrganizationChartNode[]
}

export interface ReportingLine {
  employee: OrganizationEmployeeReference | null
  manager: OrganizationEmployeeReference | null
  branch: Pick<Branch, 'id' | 'name' | 'code'> | null
  department: Pick<Department, 'id' | 'name' | 'code'> | null
  division: Pick<Division, 'id' | 'name' | 'code'> | null
  section: Pick<Section, 'id' | 'name' | 'code'> | null
  position: Pick<Position, 'id' | 'name' | 'code' | 'grade'> | null
  direct_reports_count: number
}

export interface OrganizationSummary {
  companies: number
  branches: number
  departments: number
  divisions: number
  sections: number
  positions: number
  employees: number
  active_reporting_lines: number
}

export interface OrganizationOverview {
  summary: OrganizationSummary
  companies: OrganizationCompanyNode[]
  reporting_lines: ReportingLine[]
  organization_chart: OrganizationChartNode[]
  operational_teams: Team[]
}

export interface OrganizationLookupEmployee {
  id: number
  employee_number: string
  full_name: string
  job_title: string
}

export interface OrganizationLookups {
  companies: Company[]
  branches: Branch[]
  departments: Department[]
  divisions: Division[]
  sections: Section[]
  positions: Position[]
  employees: OrganizationLookupEmployee[]
}

export interface DashboardSummary {
  date: string
  metrics: {
    total_employees: number
    active_employees: number
    total_departments: number
    new_hires_this_month: number
    attendance_today: number
    late_employees_today: number
    leave_today: number
  }
  attendance: {
    today: {
      date: string
      attendance_count: number
      late_count: number
      on_time_count: number
      on_leave_count: number
      attendance_rate: number
    }
    month: {
      records_this_month: number
      late_records_this_month: number
      overtime_minutes_this_month: number
      weekend_records_this_month: number
      holiday_records_this_month: number
      pending_corrections: number
      pending_approvals: number
    }
  }
  leave: {
    today_count: number
    pending_requests: number
    pending_approvals: number
    upcoming_approved: number
    available_days_total: number
  }
  payroll: {
    display_month: string | null
    stats: {
      runs_total: number
      approved_runs: number
      pending_approvals: number
      current_month_net: number
      current_month_gross: number
      latest_month: string | null
      display_gross: number
      display_net: number
    }
    latest_run: PayrollRun | null
  }
  recruitment: {
    stats: {
      open_vacancies: number
      active_candidates: number
      active_applications: number
      upcoming_interviews: number
      offers_sent: number
      hires: number
      offer_acceptance_rate: number
    }
    pipeline: Array<{
      stage: string
      count: number
    }>
    upcoming_interviews: RecruitmentInterview[]
    vacancy_snapshot: RecruitmentVacancy[]
  }
  departments: {
    total: number
    items: Array<{
      id: number
      name: string
      code: string
      employees_count: number
      active_employees_count: number
      share_of_workforce: number
      head: {
        id: number
        employee_number: string
        full_name: string
        job_title: string | null
      } | null
    }>
  }
  charts: {
    department_headcount: Array<{
      id: number
      name: string
      code: string
      employees_count: number
      active_employees_count: number
      share_of_workforce: number
      head: {
        id: number
        employee_number: string
        full_name: string
        job_title: string | null
      } | null
    }>
    employment_status: Array<{
      status: string
      label: string
      value: number
    }>
    attendance_status_today: Array<{
      status: string
      label: string
      value: number
    }>
    hiring_trend: Array<{
      month: string
      label: string
      hires: number
    }>
    recruitment_pipeline: Array<{
      stage: string
      count: number
    }>
  }
  statistics: {
    active_employee_ratio: number
    attendance_capture_rate: number
    payroll_completion_rate: number
    offer_acceptance_rate: number
    pending_leave_approvals: number
    pending_attendance_corrections: number
    pending_payroll_approvals: number
  }
  recent_hires: Employee[]
  activity_timeline: AuditLog[]
}

export interface LeaveType {
  id: number
  code: string
  name: string
  description: string | null
  default_days: number
  deducts_balance: boolean
  count_weekends: boolean
  count_holidays: boolean
  color: string | null
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
  total_days: number | string
  calendar_days: number | null
  balance_days: number | null
  reason: string
  submitted_at: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  leave_type: Pick<LeaveType, 'id' | 'code' | 'name' | 'color' | 'deducts_balance'> | null
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
  counted_dates: string[]
  skipped_weekends: string[]
  skipped_holidays: string[]
  balance_by_year: Record<string, number>
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
    total_days: number | string
    reason: string
    leave_type: Pick<LeaveType, 'id' | 'code' | 'name' | 'color'> | null
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
  auditable_type: string
  auditable_id: number
  ip_address: string | null
  browser: string | null
  user_agent: string | null
  created_at: string
  actor: {
    id: number
    name: string
    email: string
  } | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
}

export interface LeaveBalance {
  id: number
  year: number
  allocated_days: number
  carried_over_days: number
  used_days: number
  pending_days: number
  adjustment_days: number
  available_days: number
  leave_type: Pick<LeaveType, 'id' | 'code' | 'name' | 'color' | 'default_days' | 'deducts_balance'> | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  meta: Record<string, unknown> | null
}

export interface LeaveReminder {
  type: 'low_balance' | 'approval' | 'upcoming_leave' | 'holiday'
  severity: 'neutral' | 'success' | 'warning' | 'danger'
  title: string
  description: string
  date: string | null
}

export interface LeaveOverview {
  date: string
  employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  balances: LeaveBalance[]
  holidays: AttendanceHoliday[]
  reminders: LeaveReminder[]
  stats: {
    visible_requests: number
    pending_requests: number
    pending_approvals: number
    upcoming_approved: number
    upcoming_holidays: number
    available_days_total: number
  }
}

export interface LeaveCalendarDayEvent {
  type: 'holiday' | 'leave'
  title: string
  status: string
  color: string | null
  leave_request_id?: number
}

export interface LeaveCalendarDay {
  date: string
  day: number
  is_current_month: boolean
  is_weekend: boolean
  holiday: {
    id: number
    name: string
    type: string
  } | null
  events: LeaveCalendarDayEvent[]
}

export interface LeaveCalendar {
  month: string
  month_label: string
  starts_on: string
  ends_on: string
  employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  days: LeaveCalendarDay[]
}

export interface AttendanceShift {
  id: number
  code: string
  name: string
  start_time: string
  end_time: string
  grace_minutes: number
  requires_gps: boolean
  requires_photo: boolean
  requires_qr: boolean
  latitude: number | null
  longitude: number | null
  radius_meters: number | null
  qr_token: string | null
  is_active: boolean
  assignments_count?: number
  meta: Record<string, unknown> | null
}

export interface AttendanceHoliday {
  id: number
  name: string
  holiday_date: string
  type: string
  notes: string | null
}

export interface AttendanceRecord {
  id: number
  attendance_date: string
  status: string
  clock_in_at: string | null
  clock_out_at: string | null
  clock_in_source: string | null
  clock_out_source: string | null
  clock_in_photo_url: string | null
  clock_out_photo_url: string | null
  clock_in_latitude: number | null
  clock_in_longitude: number | null
  clock_out_latitude: number | null
  clock_out_longitude: number | null
  is_late: boolean
  late_minutes: number
  is_overtime: boolean
  overtime_minutes: number
  worked_minutes: number
  is_weekend: boolean
  is_holiday: boolean
  is_corrected: boolean
  notes: string | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    branch: string | null
    department: string | null
    manager: {
      id: number
      employee_number: string
      full_name: string
    } | null
  } | null
  shift: Pick<
    AttendanceShift,
    'id' | 'code' | 'name' | 'start_time' | 'end_time' | 'grace_minutes' | 'requires_gps' | 'requires_photo' | 'requires_qr' | 'qr_token'
  > | null
  holiday: Pick<AttendanceHoliday, 'id' | 'name' | 'holiday_date' | 'type'> | null
  created_by: {
    id: number
    name: string
    email: string
  } | null
  updated_by: {
    id: number
    name: string
    email: string
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface AttendanceCorrection {
  id: number
  status: string
  requested_attendance_date: string
  requested_clock_in_at: string | null
  requested_clock_out_at: string | null
  reason: string
  remarks: string | null
  acted_at: string | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    branch: string | null
    department: string | null
  } | null
  attendance_record: {
    id: number
    attendance_date: string
    status: string
    clock_in_at: string | null
    clock_out_at: string | null
    shift: Pick<AttendanceShift, 'id' | 'code' | 'name'> | null
  } | null
  requester: {
    id: number
    name: string
    email: string
  } | null
  approver: {
    id: number
    name: string
    email: string
  } | null
  reviewer: {
    id: number
    name: string
    email: string
  } | null
  snapshot_before: Record<string, unknown> | null
  snapshot_after: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface AttendanceLookupEmployee {
  id: number
  employee_number: string
  full_name: string
  branch: string | null
  department: string | null
}

export interface AttendanceLookups {
  employees: AttendanceLookupEmployee[]
  shifts: AttendanceShift[]
  holidays: AttendanceHoliday[]
  today: {
    date: string
    shift: AttendanceShift | null
    record: AttendanceRecord | null
  }
}

export interface AttendanceOverview {
  today: {
    date: string
    employee: AttendanceLookupEmployee | null
    shift: AttendanceShift | null
    record: AttendanceRecord | null
    holiday: AttendanceHoliday | null
  }
  stats: {
    records_this_month: number
    late_records_this_month: number
    overtime_minutes_this_month: number
    weekend_records_this_month: number
    holiday_records_this_month: number
    pending_corrections: number
    pending_approvals: number
  }
}

export interface AttendanceReportSummary {
  total_records: number
  present_records: number
  late_records: number
  overtime_minutes: number
  worked_minutes: number
  weekend_records: number
  holiday_records: number
  pending_corrections: number
}

export interface AttendanceReport {
  summary: AttendanceReportSummary
  records: AttendanceRecord[]
}

export interface PayrollLookupEmployee {
  id: number
  employee_number: string
  full_name: string
  department: string | null
}

export interface PayrollRunSummary {
  employees_count: number
  basic_salary_total: number
  allowance_total: number
  deduction_total: number
  tax_total: number
  bpjs_total: number
  overtime_total: number
  bonus_total: number
  thr_total: number
  gross_total: number
  net_total: number
}

export interface PayrollRunApproval {
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
  payroll_run?: {
    id: number
    payroll_month: string
    title: string
    status: string
  } | null
}

export interface PayrollItem {
  id: number
  currency: string
  basic_salary: number
  allowance_amount: number
  deduction_amount: number
  tax_amount: number
  bpjs_amount: number
  overtime_minutes: number
  overtime_amount: number
  bonus_amount: number
  thr_amount: number
  gross_amount: number
  net_amount: number
  notes: string | null
  generated_at: string | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
    position: string | null
  } | null
  payroll_run?: {
    id: number
    payroll_month: string
    title: string
    status: string
    period_start: string
    period_end: string
  } | null
  salary_breakdown: Array<Record<string, unknown>>
  allowance_breakdown: Array<Record<string, unknown>>
  deduction_breakdown: Array<Record<string, unknown>>
  formula: Record<string, unknown>
  meta: Record<string, unknown> | null
}

export interface PayrollRun {
  id: number
  payroll_month: string
  title: string
  period_start: string
  period_end: string
  status: string
  overtime_rate_per_hour: number | null
  overtime_multiplier: number
  tax_rate: number
  bpjs_health_rate: number
  bpjs_employment_rate: number
  notes: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  include_thr: boolean
  formula_note: string | null
  summary: PayrollRunSummary | null
  items_count: number
  submitter: {
    id: number
    name: string
    email: string
  } | null
  reviewer: {
    id: number
    name: string
    email: string
  } | null
  approvals: PayrollRunApproval[]
  items: PayrollItem[]
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PayrollOverview {
  current_date: string
  latest_run: PayrollRun | null
  latest_payslip: PayrollItem | null
  stats: {
    runs_total: number
    approved_runs: number
    pending_approvals: number
    current_month_net: number
    current_month_gross: number
    latest_month: string | null
  }
}

export interface PayrollLookups {
  employees: PayrollLookupEmployee[]
  defaults: {
    payroll_month: string
    period_start: string
    period_end: string
    tax_rate: number
    bpjs_health_rate: number
    bpjs_employment_rate: number
    overtime_multiplier: number
  }
}

export interface RecruitmentVacancy {
  id: number
  code: string
  title: string
  employment_type: string
  workplace_type: string
  status: string
  openings_count: number
  min_experience_years: number
  salary_min: number | null
  salary_max: number | null
  currency: string
  publish_date: string | null
  close_date: string | null
  description: string | null
  requirements: string | null
  notes: string | null
  department: Pick<Department, 'id' | 'name' | 'code'> | null
  branch: Pick<Branch, 'id' | 'name' | 'code'> | null
  position: Pick<Position, 'id' | 'name' | 'code' | 'grade'> | null
  recruiter: {
    id: number
    name: string
    email: string
  } | null
  hiring_manager: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  applications_count: number | null
  active_applications_count: number | null
  hired_applications_count: number | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface RecruitmentInterview {
  id: number
  title: string
  interview_type: string
  stage: string
  scheduled_at: string
  duration_minutes: number
  location: string | null
  status: string
  score: number | null
  feedback: string | null
  notes: string | null
  interviewer: {
    id: number
    name: string
    email: string
  } | null
  application?: {
    id: number
    stage: string
    status: string
    candidate: {
      id: number
      candidate_code: string
      full_name: string
    } | null
    vacancy: {
      id: number
      code: string
      title: string
    } | null
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface RecruitmentAssessment {
  id: number
  title: string
  assessment_type: string
  assigned_at: string | null
  due_at: string | null
  completed_at: string | null
  status: string
  score: number | null
  max_score: number | null
  result: string | null
  notes: string | null
  reviewer: {
    id: number
    name: string
    email: string
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface RecruitmentApplication {
  id: number
  applied_at: string
  stage: string
  status: string
  rating: number | null
  offer_sent_at: string | null
  offer_accepted_at: string | null
  offer_letter_url: string | null
  offer_letter_file_name: string | null
  rejection_reason: string | null
  notes: string | null
  candidate: {
    id: number
    candidate_code: string
    full_name: string
    email: string
    phone: string | null
    source: string | null
    location: string | null
    current_company: string | null
    current_position: string | null
    experience_years: number
    expected_salary: number | null
    currency: string
    summary: string | null
    status: string
    cv_url: string | null
    cv_file_name: string | null
  } | null
  vacancy: {
    id: number
    code: string
    title: string
    status: string
    department: string | null
    branch: string | null
    employment_type: string
  } | null
  recruiter: {
    id: number
    name: string
    email: string
  } | null
  hired_employee: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  interviews: RecruitmentInterview[]
  assessments: RecruitmentAssessment[]
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface RecruitmentCandidate {
  id: number
  candidate_code: string
  full_name: string
  email: string
  phone: string | null
  source: string | null
  location: string | null
  current_company: string | null
  current_position: string | null
  experience_years: number
  expected_salary: number | null
  currency: string
  summary: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  status: string
  cv_url: string | null
  cv_file_name: string | null
  last_contacted_at: string | null
  hired_at: string | null
  applications: RecruitmentApplication[]
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface RecruitmentOverview {
  current_date: string
  stats: {
    open_vacancies: number
    active_candidates: number
    active_applications: number
    upcoming_interviews: number
    offers_sent: number
    hires: number
    offer_acceptance_rate: number
  }
  pipeline: Array<{
    stage: string
    count: number
  }>
  upcoming_interviews: RecruitmentInterview[]
  recent_candidates: RecruitmentCandidate[]
  vacancy_snapshot: RecruitmentVacancy[]
}

export interface RecruitmentLookups {
  departments: Array<Pick<Department, 'id' | 'name' | 'code'>>
  branches: Array<Pick<Branch, 'id' | 'name' | 'code'>>
  positions: Array<Pick<Position, 'id' | 'name' | 'code' | 'grade'> & {
    division_id: number | null
    section_id: number | null
  }>
  hiring_managers: Array<{
    id: number
    employee_number: string
    full_name: string
    job_title: string
  }>
  recruiters: Array<{
    id: number
    name: string
    email: string
  }>
  stages: Array<{
    value: string
    label: string
  }>
  application_statuses: Array<{
    value: string
    label: string
  }>
  vacancy_statuses: Array<{
    value: string
    label: string
  }>
  employment_types: Array<{
    value: string
    label: string
  }>
  workplace_types: Array<{
    value: string
    label: string
  }>
  interview_types: Array<{
    value: string
    label: string
  }>
  assessment_types: Array<{
    value: string
    label: string
  }>
  defaults: {
    status: string
    stage: string
    candidate_status: string
    currency: string
    publish_date: string
    hire_date: string
  }
}

export interface PerformanceCycle {
  id: number
  code: string
  name: string
  review_type: string
  period_start: string
  period_end: string
  status: string
  description: string | null
  goals_count: number | null
  reviews_count: number | null
  completed_reviews_count: number | null
  creator: {
    id: number
    name: string
    email: string
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PerformanceGoal {
  id: number
  title: string
  goal_type: string
  category: string | null
  description: string | null
  target_value: number | null
  current_value: number | null
  unit: string | null
  weight: number
  progress_percent: number
  status: string
  due_date: string | null
  notes: string | null
  cycle: {
    id: number
    code: string
    name: string
    status: string
    review_type: string
  } | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    job_title: string
    department: string | null
  } | null
  manager: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PerformanceFeedback {
  id: number
  feedback_type: string
  relationship: string | null
  strengths: string | null
  improvements: string | null
  comments: string | null
  rating: number | null
  is_anonymous: boolean
  submitted_at: string | null
  reviewer: {
    employee: {
      id: number
      employee_number: string
      full_name: string
      department: string | null
    } | null
    user: {
      id: number
      name: string
      email: string
    } | null
  } | null
  review?: {
    id: number
    status: string
    cycle: {
      id: number
      code: string
      name: string
    } | null
    employee: {
      id: number
      employee_number: string
      full_name: string
      department: string | null
    } | null
  } | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PerformanceReview {
  id: number
  status: string
  overall_score: number | null
  overall_rating: string | null
  cycle: {
    id: number
    code: string
    name: string
    status: string
    review_type: string
    period_start: string
    period_end: string
  } | null
  employee: {
    id: number
    employee_number: string
    full_name: string
    job_title: string
    department: string | null
  } | null
  manager: {
    id: number
    employee_number: string
    full_name: string
    department: string | null
  } | null
  creator: {
    id: number
    name: string
    email: string
  } | null
  employee_review: {
    summary: string | null
    highlights: string | null
    challenges: string | null
    rating: number | null
    submitted_at: string | null
  }
  manager_review: {
    summary: string | null
    strengths: string | null
    improvements: string | null
    rating: number | null
    submitted_at: string | null
  }
  feedback_count: number
  feedbacks: PerformanceFeedback[]
  calibration_notes: string | null
  completed_at: string | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PerformanceOverview {
  current_date: string
  stats: {
    active_cycles: number
    visible_goals: number
    completed_goals: number
    open_reviews: number
    feedback_responses: number
    average_goal_progress: number
    average_review_score: number
  }
  goal_distribution: Array<{
    goal_type: string
    count: number
  }>
  review_distribution: Array<{
    status: string
    count: number
  }>
  cycle_snapshot: PerformanceCycle[]
  pending_reviews: PerformanceReview[]
  recent_feedback: PerformanceFeedback[]
}

export interface PerformanceLookups {
  employees: Array<{
    id: number
    employee_number: string
    full_name: string
    job_title: string
    department: string | null
    manager: {
      id: number
      employee_number: string
      full_name: string
    } | null
  }>
  cycles: Array<{
    id: number
    code: string
    name: string
    status: string
  }>
  goal_types: Array<{
    value: string
    label: string
  }>
  goal_statuses: Array<{
    value: string
    label: string
  }>
  review_statuses: Array<{
    value: string
    label: string
  }>
  review_types: Array<{
    value: string
    label: string
  }>
  feedback_types: Array<{
    value: string
    label: string
  }>
  defaults: {
    cycle_id: number | null
    review_type: string
    goal_type: string
    goal_status: string
    review_status: string
    feedback_type: string
    due_date: string
    current_date: string
  }
}

export interface ItAssetReference {
  id: number
  asset_code: string
  name: string
  category: string
  status: string
}

export interface ItAssetActor {
  id: number
  name: string
  email: string
}

export interface ItAssetBranchSummary {
  id: number
  name: string
  code: string
}

export interface ItAssetEmployeeSummary {
  id: number
  employee_number: string
  full_name: string
  job_title: string
  department: string | null
  branch: string | null
}

export interface ItAssetAssignment {
  id: number
  assigned_at: string
  expected_return_at: string | null
  returned_at: string | null
  assignment_condition: string | null
  return_condition: string | null
  assignment_notes: string | null
  return_notes: string | null
  status: string
  employee: ItAssetEmployeeSummary | null
  assigned_by: ItAssetActor | null
  returned_by: ItAssetActor | null
  asset: ItAssetReference | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ItAssetMaintenance {
  id: number
  maintenance_type: string
  vendor_name: string | null
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  status: string
  warranty_claim: boolean
  cost_amount: number | null
  currency: string
  notes: string | null
  resolution: string | null
  reported_by: ItAssetActor | null
  asset: ItAssetReference | null
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ItAssetHistoryItem {
  type: string
  title: string
  description: string | null
  status: string | null
  occurred_at: string | null
}

export interface ItAsset {
  id: number
  asset_code: string
  category: string
  name: string
  brand: string | null
  model: string | null
  serial_number: string | null
  phone_number: string | null
  license_key: string | null
  license_expires_at: string | null
  vendor_name: string | null
  purchase_date: string | null
  purchase_cost: number | null
  currency: string
  status: string
  qr_code_value: string
  warranty_expires_at: string | null
  maintenance_due_at: string | null
  warranty_status: string
  license_status: string
  notes: string | null
  branch: ItAssetBranchSummary | null
  creator: ItAssetActor | null
  assignments_count: number | null
  maintenances_count: number | null
  current_assignment: ItAssetAssignment | null
  latest_maintenance: ItAssetMaintenance | null
  assignment_history: ItAssetAssignment[]
  maintenance_history: ItAssetMaintenance[]
  history: ItAssetHistoryItem[]
  meta: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ItAssetOverview {
  current_date: string
  stats: {
    total_assets: number
    assigned_assets: number
    maintenance_assets: number
    available_assets: number
    software_licenses: number
    expiring_coverage: number
  }
  category_distribution: Array<{
    category: string
    count: number
  }>
  status_distribution: Array<{
    status: string
    count: number
  }>
  warranty_watch: ItAsset[]
  maintenance_queue: ItAssetMaintenance[]
}

export interface ItAssetLookups {
  employees: ItAssetEmployeeSummary[]
  branches: ItAssetBranchSummary[]
  categories: Array<{
    value: string
    label: string
  }>
  asset_statuses: Array<{
    value: string
    label: string
  }>
  assignment_conditions: Array<{
    value: string
    label: string
  }>
  maintenance_types: Array<{
    value: string
    label: string
  }>
  maintenance_statuses: Array<{
    value: string
    label: string
  }>
  defaults: {
    category: string
    status: string
    currency: string
    current_date: string
    purchase_date: string
    assignment_condition: string
    maintenance_type: string
    maintenance_status: string
  }
}

export interface UserNotification {
  id: string
  type: string
  title: string
  subject: string | null
  message: string
  action_url: string | null
  action_label: string | null
  channels: string[]
  source: string
  sender: {
    id: number
    name: string
    email: string
  } | null
  payload: Record<string, unknown>
  read_at: string | null
  is_read: boolean
  created_at: string
}

export interface NotificationChannelConfig {
  id: number
  channel: string
  label: string
  driver: string
  transport_mode: string
  is_enabled: boolean
  status: string
  description: string | null
  config: Record<string, unknown> | null
  last_tested_at: string | null
  updated_by: {
    id: number
    name: string
    email: string
  } | null
  created_at: string
  updated_at: string
}

export interface NotificationDeliveryLog {
  id: number
  source: string
  channel: string
  notification_type: string
  subject: string | null
  title: string | null
  message: string | null
  recipient: string | null
  status: string
  transport_mode: string
  notification_uuid: string | null
  payload: Record<string, unknown> | null
  sent_at: string | null
  recipient_user: {
    id: number
    name: string
    email: string
    employee: {
      id: number
      employee_number: string
      full_name: string
      department: string | null
    } | null
  } | null
  sender: {
    id: number
    name: string
    email: string
  } | null
  created_at: string
  updated_at: string
}

export interface NotificationOverview {
  current_date: string
  stats: {
    unread_inbox: number
    total_inbox: number
    delivered_today: number
    live_channels: number
    ready_connectors: number
    disabled_channels: number
  }
  channel_health: NotificationChannelConfig[]
  recent_inbox: UserNotification[]
  recent_deliveries: NotificationDeliveryLog[]
}

export interface NotificationLookups {
  can_manage: boolean
  channels: Array<{
    channel: string
    label: string
    transport_mode: string
    is_enabled: boolean
  }>
  roles: Array<{
    id: number
    name: string
    label: string
  }>
  users: Array<{
    id: number
    name: string
    email: string
    employee: {
      id: number
      employee_number: string
      full_name: string
      department: string | null
    } | null
  }>
  statuses: Array<{
    value: string
    label: string
  }>
  defaults: {
    channels: string[]
    action_label: string
    action_url: string
  }
}
