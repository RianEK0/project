import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  AttendanceCorrection,
  AttendanceHoliday,
  AttendanceLookups,
  AttendanceOverview,
  AttendanceRecord,
  AttendanceReport,
  AttendanceShift,
} from '@/types/api'

export interface AttendanceReportFilters {
  employee_id?: number
  shift_id?: number
  status?: string
  start_date?: string
  end_date?: string
  late_only?: boolean
  holiday_only?: boolean
  weekend_only?: boolean
}

export interface ClockAttendancePayload {
  latitude?: number
  longitude?: number
  qr_token?: string
  photo?: File
  notes?: string
}

export interface ManualAttendancePayload {
  employee_id: number
  attendance_date: string
  shift_id?: number
  clock_in_at: string
  clock_out_at: string
  clock_in_photo?: File
  clock_out_photo?: File
  notes?: string
}

export interface AttendanceCorrectionPayload {
  attendance_record_id: number
  attendance_date: string
  requested_clock_in_at: string
  requested_clock_out_at?: string
  reason: string
  notes?: string
}

export interface AttendanceShiftPayload {
  code: string
  name: string
  start_time: string
  end_time: string
  grace_minutes?: number
  requires_gps?: boolean
  requires_photo?: boolean
  requires_qr?: boolean
  latitude?: number
  longitude?: number
  radius_meters?: number
  qr_token?: string
  is_active?: boolean
}

export interface AttendanceShiftAssignmentPayload {
  employee_id: number
  shift_id: number
  start_date: string
  end_date?: string
}

export interface AttendanceHolidayPayload {
  name: string
  holiday_date: string
  type: string
  notes?: string
}

export async function getAttendanceOverview() {
  const { data } = await http.get<ApiEnvelope<AttendanceOverview>>('/attendance/overview')
  return data.data
}

export async function getAttendanceLookups() {
  const { data } = await http.get<ApiEnvelope<AttendanceLookups>>('/attendance/lookups')
  return data.data
}

export async function getAttendanceRecords(filters: AttendanceReportFilters = {}) {
  const { data } = await http.get<ApiEnvelope<AttendanceRecord[]>>('/attendance', {
    params: filters,
  })

  return data.data
}

export async function getAttendanceReport(filters: AttendanceReportFilters = {}) {
  const { data } = await http.get<ApiEnvelope<AttendanceReport>>('/attendance/report', {
    params: filters,
  })

  return data.data
}

export async function clockInAttendance(payload: ClockAttendancePayload) {
  const { data } = await http.post<ApiEnvelope<AttendanceRecord>>(
    '/attendance/clock-in',
    toClockFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function clockOutAttendance(payload: ClockAttendancePayload) {
  const { data } = await http.post<ApiEnvelope<AttendanceRecord>>(
    '/attendance/clock-out',
    toClockFormData(payload),
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function saveManualAttendance(payload: ManualAttendancePayload) {
  const formData = new FormData()

  appendFormValue(formData, 'employee_id', payload.employee_id)
  appendFormValue(formData, 'attendance_date', payload.attendance_date)
  appendFormValue(formData, 'shift_id', payload.shift_id)
  appendFormValue(formData, 'clock_in_at', payload.clock_in_at)
  appendFormValue(formData, 'clock_out_at', payload.clock_out_at)
  appendFormValue(formData, 'clock_in_photo', payload.clock_in_photo)
  appendFormValue(formData, 'clock_out_photo', payload.clock_out_photo)
  appendFormValue(formData, 'notes', payload.notes)

  const { data } = await http.post<ApiEnvelope<AttendanceRecord>>(
    '/attendance/manual',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return data.data
}

export async function getAttendanceCorrections() {
  const { data } = await http.get<ApiEnvelope<AttendanceCorrection[]>>('/attendance/corrections')
  return data.data
}

export async function createAttendanceCorrection(payload: AttendanceCorrectionPayload) {
  const { data } = await http.post<ApiEnvelope<AttendanceCorrection>>('/attendance/corrections', payload)
  return data.data
}

export async function getAttendanceApprovals() {
  const { data } = await http.get<ApiEnvelope<AttendanceCorrection[]>>('/attendance/approvals')
  return data.data
}

export async function approveAttendanceCorrection(attendanceCorrectionId: number, remarks?: string) {
  const { data } = await http.post<ApiEnvelope<AttendanceCorrection>>(
    `/attendance/corrections/${attendanceCorrectionId}/approve`,
    remarks ? { remarks } : {},
  )

  return data.data
}

export async function rejectAttendanceCorrection(attendanceCorrectionId: number, remarks: string) {
  const { data } = await http.post<ApiEnvelope<AttendanceCorrection>>(
    `/attendance/corrections/${attendanceCorrectionId}/reject`,
    { remarks },
  )

  return data.data
}

export async function getAttendanceShifts() {
  const { data } = await http.get<ApiEnvelope<AttendanceShift[]>>('/attendance/shifts')
  return data.data
}

export async function saveAttendanceShift(payload: AttendanceShiftPayload) {
  const { data } = await http.post<ApiEnvelope<AttendanceShift>>('/attendance/shifts', payload)
  return data.data
}

export async function assignAttendanceShift(payload: AttendanceShiftAssignmentPayload) {
  const { data } = await http.post<ApiEnvelope<{
    id: number
    employee: {
      id: number | null
      employee_number: string | null
      full_name: string | null
      department: string | null
    }
    shift: AttendanceShift | null
    start_date: string
    end_date: string | null
  }>>('/attendance/shift-assignments', payload)

  return data.data
}

export async function getAttendanceHolidays() {
  const { data } = await http.get<ApiEnvelope<AttendanceHoliday[]>>('/attendance/holidays')
  return data.data
}

export async function saveAttendanceHoliday(payload: AttendanceHolidayPayload) {
  const { data } = await http.post<ApiEnvelope<AttendanceHoliday>>('/attendance/holidays', payload)
  return data.data
}

function toClockFormData(payload: ClockAttendancePayload) {
  const formData = new FormData()

  appendFormValue(formData, 'latitude', payload.latitude)
  appendFormValue(formData, 'longitude', payload.longitude)
  appendFormValue(formData, 'qr_token', payload.qr_token)
  appendFormValue(formData, 'photo', payload.photo)
  appendFormValue(formData, 'notes', payload.notes)

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
