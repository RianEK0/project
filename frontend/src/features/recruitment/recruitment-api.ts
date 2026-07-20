import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  RecruitmentApplication,
  RecruitmentAssessment,
  RecruitmentCandidate,
  RecruitmentInterview,
  RecruitmentLookups,
  RecruitmentOverview,
  RecruitmentVacancy,
} from '@/types/api'

export interface RecruitmentApplicationFilters {
  vacancy_id?: number
  stage?: string
  status?: string
}

export interface RecruitmentScheduleFilters {
  start_date?: string
  end_date?: string
}

export interface CreateRecruitmentVacancyPayload {
  title: string
  employment_type: string
  workplace_type?: string
  status?: string
  department_id?: number
  branch_id?: number
  position_id?: number
  hiring_manager_id?: number
  openings_count: number
  min_experience_years?: number
  salary_min?: number
  salary_max?: number
  currency?: string
  publish_date?: string
  close_date?: string
  description?: string
  requirements?: string
  notes?: string
}

export interface CreateRecruitmentCandidatePayload {
  full_name: string
  email: string
  phone?: string
  source?: string
  location?: string
  current_company?: string
  current_position?: string
  experience_years?: number
  expected_salary?: number
  currency?: string
  summary?: string
  vacancy_id?: number
  application_notes?: string
  cv?: File
}

export interface UpdateRecruitmentApplicationPayload {
  stage?: string
  status?: string
  rating?: number
  offer_sent_at?: string
  offer_accepted_at?: string
  rejection_reason?: string
  notes?: string
  offer_letter?: File
}

export interface ScheduleRecruitmentInterviewPayload {
  title: string
  interview_type: string
  scheduled_at: string
  duration_minutes?: number
  location?: string
  notes?: string
}

export interface RecordRecruitmentAssessmentPayload {
  title: string
  assessment_type: string
  assigned_at?: string
  due_at?: string
  completed_at?: string
  status: string
  score?: number
  max_score?: number
  result?: string
  notes?: string
}

export interface HireRecruitmentCandidatePayload {
  hire_date: string
  employment_type: string
  job_title?: string
  department_id?: number
  branch_id?: number
  position_id?: number
  manager_id?: number
  work_email?: string
  base_salary?: number
  salary_currency?: string
  contract_number?: string
  contract_end_date?: string
  create_contract?: boolean
  notes?: string
}

export async function getRecruitmentOverview() {
  const { data } = await http.get<ApiEnvelope<RecruitmentOverview>>('/recruitment/overview')
  return data.data
}

export async function getRecruitmentLookups() {
  const { data } = await http.get<ApiEnvelope<RecruitmentLookups>>('/recruitment/lookups')
  return data.data
}

export async function getRecruitmentVacancies() {
  const { data } = await http.get<ApiEnvelope<RecruitmentVacancy[]>>('/recruitment/vacancies')
  return data.data
}

export async function getRecruitmentCandidates() {
  const { data } = await http.get<ApiEnvelope<RecruitmentCandidate[]>>('/recruitment/candidates')
  return data.data
}

export async function getRecruitmentApplications(filters: RecruitmentApplicationFilters = {}) {
  const { data } = await http.get<ApiEnvelope<RecruitmentApplication[]>>('/recruitment/applications', {
    params: filters,
  })

  return data.data
}

export async function getRecruitmentApplication(applicationId: number) {
  const { data } = await http.get<ApiEnvelope<RecruitmentApplication>>(`/recruitment/applications/${applicationId}`)
  return data.data
}

export async function getRecruitmentInterviewSchedule(filters: RecruitmentScheduleFilters = {}) {
  const { data } = await http.get<ApiEnvelope<RecruitmentInterview[]>>('/recruitment/interviews/schedule', {
    params: filters,
  })

  return data.data
}

export async function createRecruitmentVacancy(payload: CreateRecruitmentVacancyPayload) {
  const { data } = await http.post<ApiEnvelope<RecruitmentVacancy>>('/recruitment/vacancies', payload)
  return data.data
}

export async function createRecruitmentCandidate(payload: CreateRecruitmentCandidatePayload) {
  const { data } = await http.post<ApiEnvelope<RecruitmentCandidate>>(
    '/recruitment/candidates',
    toCandidateFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function updateRecruitmentApplication(applicationId: number, payload: UpdateRecruitmentApplicationPayload) {
  const { data } = await http.post<ApiEnvelope<RecruitmentApplication>>(
    `/recruitment/applications/${applicationId}/update`,
    toApplicationFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function scheduleRecruitmentInterview(applicationId: number, payload: ScheduleRecruitmentInterviewPayload) {
  const { data } = await http.post<ApiEnvelope<RecruitmentInterview>>(
    `/recruitment/applications/${applicationId}/interviews`,
    payload,
  )

  return data.data
}

export async function recordRecruitmentAssessment(applicationId: number, payload: RecordRecruitmentAssessmentPayload) {
  const { data } = await http.post<ApiEnvelope<RecruitmentAssessment>>(
    `/recruitment/applications/${applicationId}/assessments`,
    payload,
  )

  return data.data
}

export async function hireRecruitmentCandidate(applicationId: number, payload: HireRecruitmentCandidatePayload) {
  const { data } = await http.post<ApiEnvelope<RecruitmentApplication>>(
    `/recruitment/applications/${applicationId}/hire`,
    payload,
  )

  return data.data
}

function toCandidateFormData(payload: CreateRecruitmentCandidatePayload) {
  const formData = new FormData()

  appendFormValue(formData, 'full_name', payload.full_name)
  appendFormValue(formData, 'email', payload.email)
  appendFormValue(formData, 'phone', payload.phone)
  appendFormValue(formData, 'source', payload.source)
  appendFormValue(formData, 'location', payload.location)
  appendFormValue(formData, 'current_company', payload.current_company)
  appendFormValue(formData, 'current_position', payload.current_position)
  appendFormValue(formData, 'experience_years', payload.experience_years)
  appendFormValue(formData, 'expected_salary', payload.expected_salary)
  appendFormValue(formData, 'currency', payload.currency)
  appendFormValue(formData, 'summary', payload.summary)
  appendFormValue(formData, 'vacancy_id', payload.vacancy_id)
  appendFormValue(formData, 'application_notes', payload.application_notes)
  appendFormValue(formData, 'cv', payload.cv)

  return formData
}

function toApplicationFormData(payload: UpdateRecruitmentApplicationPayload) {
  const formData = new FormData()

  appendFormValue(formData, 'stage', payload.stage)
  appendFormValue(formData, 'status', payload.status)
  appendFormValue(formData, 'rating', payload.rating)
  appendFormValue(formData, 'offer_sent_at', payload.offer_sent_at)
  appendFormValue(formData, 'offer_accepted_at', payload.offer_accepted_at)
  appendFormValue(formData, 'rejection_reason', payload.rejection_reason)
  appendFormValue(formData, 'notes', payload.notes)
  appendFormValue(formData, 'offer_letter', payload.offer_letter)

  return formData
}

function appendFormValue(formData: FormData, key: string, value: boolean | number | string | File | undefined) {
  if (value === undefined || value === '') {
    return
  }

  if (typeof value === 'boolean') {
    formData.append(key, value ? '1' : '0')
    return
  }

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  formData.append(key, String(value))
}
