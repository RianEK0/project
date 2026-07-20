import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  PerformanceCycle,
  PerformanceFeedback,
  PerformanceGoal,
  PerformanceLookups,
  PerformanceOverview,
  PerformanceReview,
} from '@/types/api'

export interface PerformanceGoalFilters {
  cycle_id?: number
  employee_id?: number
  goal_type?: string
  status?: string
}

export interface PerformanceReviewFilters {
  cycle_id?: number
  employee_id?: number
  status?: string
}

export interface CreatePerformanceCyclePayload {
  name: string
  review_type?: string
  period_start: string
  period_end: string
  status?: string
  description?: string
}

export interface CreatePerformanceGoalPayload {
  cycle_id: number
  employee_id: number
  manager_id?: number
  title: string
  goal_type?: string
  category?: string
  description?: string
  target_value?: number
  current_value?: number
  unit?: string
  weight?: number
  progress_percent?: number
  status?: string
  due_date?: string
  notes?: string
}

export interface UpdatePerformanceGoalPayload {
  title?: string
  goal_type?: string
  category?: string
  description?: string
  target_value?: number
  current_value?: number
  unit?: string
  weight?: number
  progress_percent?: number
  status?: string
  due_date?: string
  notes?: string
}

export interface CreatePerformanceReviewPayload {
  cycle_id: number
  employee_id: number
  manager_id?: number
  status?: string
}

export interface SubmitEmployeePerformanceReviewPayload {
  employee_review_summary: string
  employee_review_highlights?: string
  employee_review_challenges?: string
  employee_rating?: number
}

export interface SubmitManagerPerformanceReviewPayload {
  manager_review_summary: string
  manager_review_strengths?: string
  manager_review_improvements?: string
  manager_rating?: number
  overall_score?: number
  overall_rating?: string
  calibration_notes?: string
}

export interface CreatePerformanceFeedbackPayload {
  reviewer_id?: number
  feedback_type?: string
  relationship?: string
  strengths?: string
  improvements?: string
  comments?: string
  rating?: number
  is_anonymous?: boolean
}

export async function getPerformanceOverview() {
  const { data } = await http.get<ApiEnvelope<PerformanceOverview>>('/performance/overview')
  return data.data
}

export async function getPerformanceLookups() {
  const { data } = await http.get<ApiEnvelope<PerformanceLookups>>('/performance/lookups')
  return data.data
}

export async function getPerformanceCycles() {
  const { data } = await http.get<ApiEnvelope<PerformanceCycle[]>>('/performance/cycles')
  return data.data
}

export async function createPerformanceCycle(payload: CreatePerformanceCyclePayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceCycle>>('/performance/cycles', payload)
  return data.data
}

export async function getPerformanceGoals(filters: PerformanceGoalFilters = {}) {
  const { data } = await http.get<ApiEnvelope<PerformanceGoal[]>>('/performance/goals', {
    params: filters,
  })

  return data.data
}

export async function createPerformanceGoal(payload: CreatePerformanceGoalPayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceGoal>>('/performance/goals', payload)
  return data.data
}

export async function updatePerformanceGoal(goalId: number, payload: UpdatePerformanceGoalPayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceGoal>>(`/performance/goals/${goalId}/update`, payload)
  return data.data
}

export async function getPerformanceReviews(filters: PerformanceReviewFilters = {}) {
  const { data } = await http.get<ApiEnvelope<PerformanceReview[]>>('/performance/reviews', {
    params: filters,
  })

  return data.data
}

export async function getPerformanceReview(reviewId: number) {
  const { data } = await http.get<ApiEnvelope<PerformanceReview>>(`/performance/reviews/${reviewId}`)
  return data.data
}

export async function createPerformanceReview(payload: CreatePerformanceReviewPayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceReview>>('/performance/reviews', payload)
  return data.data
}

export async function submitEmployeePerformanceReview(reviewId: number, payload: SubmitEmployeePerformanceReviewPayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceReview>>(`/performance/reviews/${reviewId}/employee-review`, payload)
  return data.data
}

export async function submitManagerPerformanceReview(reviewId: number, payload: SubmitManagerPerformanceReviewPayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceReview>>(`/performance/reviews/${reviewId}/manager-review`, payload)
  return data.data
}

export async function createPerformanceFeedback(reviewId: number, payload: CreatePerformanceFeedbackPayload) {
  const { data } = await http.post<ApiEnvelope<PerformanceFeedback>>(`/performance/reviews/${reviewId}/feedback`, payload)
  return data.data
}
