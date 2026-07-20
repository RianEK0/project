import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  ApprovalInboxItem,
  LeaveCalendar,
  LeaveOverview,
  LeaveRequest,
  LeaveType,
} from '@/types/api'

export interface CreateLeaveRequestPayload {
  leave_type_id: number
  start_date: string
  end_date: string
  reason: string
}

export async function getLeaveOverview() {
  const { data } = await http.get<ApiEnvelope<LeaveOverview>>('/leave-overview')
  return data.data
}

export async function getLeaveCalendar(month: string) {
  const { data } = await http.get<ApiEnvelope<LeaveCalendar>>('/leave-calendar', {
    params: {
      month,
    },
  })

  return data.data
}

export async function getLeaveTypes() {
  const { data } = await http.get<ApiEnvelope<LeaveType[]>>('/leave-types')
  return data.data
}

export async function getLeaveRequests() {
  const { data } = await http.get<ApiEnvelope<LeaveRequest[]>>('/leave-requests')
  return data.data
}

export async function createLeaveRequest(payload: CreateLeaveRequestPayload) {
  const { data } = await http.post<ApiEnvelope<LeaveRequest>>('/leave-requests', payload)
  return data.data
}

export async function getApprovalInbox() {
  const { data } = await http.get<ApiEnvelope<ApprovalInboxItem[]>>('/approvals/inbox')
  return data.data
}

export async function approveLeaveRequest(leaveRequestId: number, remarks?: string) {
  const { data } = await http.post<ApiEnvelope<LeaveRequest>>(
    `/leave-requests/${leaveRequestId}/approve`,
    remarks ? { remarks } : {},
  )

  return data.data
}

export async function rejectLeaveRequest(leaveRequestId: number, remarks: string) {
  const { data } = await http.post<ApiEnvelope<LeaveRequest>>(
    `/leave-requests/${leaveRequestId}/reject`,
    { remarks },
  )

  return data.data
}
