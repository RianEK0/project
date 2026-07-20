import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, ClipboardCheck, Clock3, FileText, MapPin, QrCode, ShieldCheck, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  approveAttendanceCorrection,
  assignAttendanceShift,
  clockInAttendance,
  clockOutAttendance,
  createAttendanceCorrection,
  getAttendanceApprovals,
  getAttendanceCorrections,
  getAttendanceHolidays,
  getAttendanceLookups,
  getAttendanceOverview,
  getAttendanceReport,
  getAttendanceShifts,
  rejectAttendanceCorrection,
  saveAttendanceHoliday,
  saveAttendanceShift,
  saveManualAttendance,
  type AttendanceCorrectionPayload,
  type AttendanceHolidayPayload,
  type AttendanceReportFilters,
  type AttendanceShiftPayload,
  type ManualAttendancePayload,
} from '@/features/attendance/attendance-api'
import { getErrorMessage } from '@/lib/http'

const statusVariantMap = {
  present: 'success',
  late: 'warning',
  manual: 'neutral',
  corrected: 'neutral',
  incomplete: 'danger',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
} as const

export function AttendancePage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canClock = session?.user.permissions.includes('attendance.clock') ?? false
  const canManual = session?.user.permissions.includes('attendance.manual') ?? false
  const canManage = session?.user.permissions.includes('attendance.manage') ?? false
  const canApprove = session?.user.permissions.includes('attendance.approve') ?? false
  const canCreateCorrection = session?.user.permissions.includes('attendance.corrections.create') ?? false

  const [reportFilters, setReportFilters] = useState<AttendanceReportFilters>({
    start_date: firstDayOfCurrentMonth(),
    end_date: todayString(),
    status: '',
  })
  const [clockForm, setClockForm] = useState({
    latitude: '',
    longitude: '',
    qr_token: '',
    notes: '',
    photo: null as File | null,
  })
  const [manualForm, setManualForm] = useState({
    employee_id: '',
    attendance_date: todayString(),
    shift_id: '',
    clock_in_at: `${todayString()}T09:00`,
    clock_out_at: `${todayString()}T18:00`,
    notes: '',
    clock_in_photo: null as File | null,
    clock_out_photo: null as File | null,
  })
  const [correctionForm, setCorrectionForm] = useState({
    attendance_record_id: '',
    attendance_date: todayString(),
    requested_clock_in_at: '',
    requested_clock_out_at: '',
    reason: '',
  })
  const [shiftForm, setShiftForm] = useState({
    code: '',
    name: '',
    start_time: '09:00',
    end_time: '18:00',
    grace_minutes: '5',
    requires_gps: false,
    requires_photo: false,
    requires_qr: false,
    latitude: '',
    longitude: '',
    radius_meters: '',
    qr_token: '',
    is_active: true,
  })
  const [assignmentForm, setAssignmentForm] = useState({
    employee_id: '',
    shift_id: '',
    start_date: todayString(),
    end_date: '',
  })
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    holiday_date: todayString(),
    type: 'public',
    notes: '',
  })
  const [approvalNotes, setApprovalNotes] = useState<Record<number, string>>({})

  const overviewQuery = useQuery({
    queryKey: ['attendance', 'overview'],
    queryFn: getAttendanceOverview,
  })

  const lookupsQuery = useQuery({
    queryKey: ['attendance', 'lookups'],
    queryFn: getAttendanceLookups,
  })

  const reportQuery = useQuery({
    queryKey: ['attendance', 'report', reportFilters],
    queryFn: () => getAttendanceReport(normalizeReportFilters(reportFilters)),
  })

  const correctionsQuery = useQuery({
    queryKey: ['attendance', 'corrections'],
    queryFn: getAttendanceCorrections,
  })

  const approvalsQuery = useQuery({
    queryKey: ['attendance', 'approvals'],
    queryFn: getAttendanceApprovals,
    enabled: canApprove,
  })

  const shiftsQuery = useQuery({
    queryKey: ['attendance', 'shifts'],
    queryFn: getAttendanceShifts,
  })

  const holidaysQuery = useQuery({
    queryKey: ['attendance', 'holidays'],
    queryFn: getAttendanceHolidays,
  })

  useEffect(() => {
    const shift = overviewQuery.data?.today.shift

    if (!shift) {
      return
    }

    setClockForm((current) => ({
      ...current,
      latitude: current.latitude || stringifyNullableNumber(shift.latitude),
      longitude: current.longitude || stringifyNullableNumber(shift.longitude),
      qr_token: current.qr_token || shift.qr_token || '',
    }))
  }, [overviewQuery.data?.today.shift?.id])

  useEffect(() => {
    const employees = lookupsQuery.data?.employees ?? []
    const shifts = shiftsQuery.data ?? []

    if (employees.length > 0 && !manualForm.employee_id) {
      setManualForm((current) => ({
        ...current,
        employee_id: String(employees[0]?.id ?? ''),
      }))
    }

    if (employees.length > 0 && !assignmentForm.employee_id) {
      setAssignmentForm((current) => ({
        ...current,
        employee_id: String(employees[0]?.id ?? ''),
      }))
    }

    if (shifts.length > 0 && !manualForm.shift_id) {
      setManualForm((current) => ({
        ...current,
        shift_id: String(shifts[0]?.id ?? ''),
      }))
    }

    if (shifts.length > 0 && !assignmentForm.shift_id) {
      setAssignmentForm((current) => ({
        ...current,
        shift_id: String(shifts[0]?.id ?? ''),
      }))
    }
  }, [assignmentForm.employee_id, assignmentForm.shift_id, lookupsQuery.data?.employees, manualForm.employee_id, manualForm.shift_id, shiftsQuery.data])

  const invalidateAttendance = () => {
    void queryClient.invalidateQueries({ queryKey: ['attendance'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  const clockInMutation = useMutation({
    mutationFn: clockInAttendance,
    onSuccess: () => {
      setClockForm((current) => ({
        ...current,
        photo: null,
        notes: '',
      }))
      invalidateAttendance()
    },
  })

  const clockOutMutation = useMutation({
    mutationFn: clockOutAttendance,
    onSuccess: () => {
      setClockForm((current) => ({
        ...current,
        photo: null,
        notes: '',
      }))
      invalidateAttendance()
    },
  })

  const manualMutation = useMutation({
    mutationFn: saveManualAttendance,
    onSuccess: () => {
      setManualForm((current) => ({
        ...current,
        attendance_date: todayString(),
        clock_in_at: `${todayString()}T09:00`,
        clock_out_at: `${todayString()}T18:00`,
        notes: '',
        clock_in_photo: null,
        clock_out_photo: null,
      }))
      invalidateAttendance()
    },
  })

  const correctionMutation = useMutation({
    mutationFn: createAttendanceCorrection,
    onSuccess: () => {
      setCorrectionForm({
        attendance_record_id: '',
        attendance_date: todayString(),
        requested_clock_in_at: '',
        requested_clock_out_at: '',
        reason: '',
      })
      invalidateAttendance()
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ correctionId, remarks }: { correctionId: number; remarks?: string }) =>
      approveAttendanceCorrection(correctionId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      invalidateAttendance()
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ correctionId, remarks }: { correctionId: number; remarks: string }) =>
      rejectAttendanceCorrection(correctionId, remarks),
    onSuccess: () => {
      setApprovalNotes({})
      invalidateAttendance()
    },
  })

  const shiftMutation = useMutation({
    mutationFn: saveAttendanceShift,
    onSuccess: () => {
      setShiftForm({
        code: '',
        name: '',
        start_time: '09:00',
        end_time: '18:00',
        grace_minutes: '5',
        requires_gps: false,
        requires_photo: false,
        requires_qr: false,
        latitude: '',
        longitude: '',
        radius_meters: '',
        qr_token: '',
        is_active: true,
      })
      invalidateAttendance()
    },
  })

  const assignmentMutation = useMutation({
    mutationFn: assignAttendanceShift,
    onSuccess: () => {
      setAssignmentForm((current) => ({
        ...current,
        start_date: todayString(),
        end_date: '',
      }))
      invalidateAttendance()
    },
  })

  const holidayMutation = useMutation({
    mutationFn: saveAttendanceHoliday,
    onSuccess: () => {
      setHolidayForm({
        name: '',
        holiday_date: todayString(),
        type: 'public',
        notes: '',
      })
      invalidateAttendance()
    },
  })

  const visibleRecords = reportQuery.data?.records ?? []
  const selectedCorrectionRecord = visibleRecords.find(
    (record) => String(record.id) === correctionForm.attendance_record_id,
  )
  const todaysRecord = overviewQuery.data?.today.record
  const todaysShift = overviewQuery.data?.today.shift
  const isClockOutReady = Boolean(todaysRecord && todaysRecord.clock_in_at && !todaysRecord.clock_out_at)

  const handleClockAction = (kind: 'in' | 'out') => {
    const payload = {
      latitude: parseOptionalNumber(clockForm.latitude),
      longitude: parseOptionalNumber(clockForm.longitude),
      qr_token: clockForm.qr_token || undefined,
      photo: clockForm.photo ?? undefined,
      notes: clockForm.notes || undefined,
    }

    if (kind === 'in') {
      clockInMutation.mutate(payload)
      return
    }

    clockOutMutation.mutate(payload)
  }

  const handleManualSubmit = () => {
    if (!manualForm.employee_id) {
      return
    }

    const payload: ManualAttendancePayload = {
      employee_id: Number(manualForm.employee_id),
      attendance_date: manualForm.attendance_date,
      shift_id: parseOptionalNumber(manualForm.shift_id),
      clock_in_at: normalizeDateTimePayload(manualForm.clock_in_at),
      clock_out_at: normalizeDateTimePayload(manualForm.clock_out_at),
      clock_in_photo: manualForm.clock_in_photo ?? undefined,
      clock_out_photo: manualForm.clock_out_photo ?? undefined,
      notes: manualForm.notes || undefined,
    }

    manualMutation.mutate(payload)
  }

  const handleCorrectionRecordChange = (recordId: string) => {
    const record = visibleRecords.find((item) => String(item.id) === recordId)

    setCorrectionForm({
      attendance_record_id: recordId,
      attendance_date: record?.attendance_date ?? todayString(),
      requested_clock_in_at: record?.clock_in_at ? toDateTimeLocalValue(record.clock_in_at) : '',
      requested_clock_out_at: record?.clock_out_at ? toDateTimeLocalValue(record.clock_out_at) : '',
      reason: '',
    })
  }

  const handleCorrectionSubmit = () => {
    if (!correctionForm.attendance_record_id) {
      return
    }

    const payload: AttendanceCorrectionPayload = {
      attendance_record_id: Number(correctionForm.attendance_record_id),
      attendance_date: correctionForm.attendance_date,
      requested_clock_in_at: normalizeDateTimePayload(correctionForm.requested_clock_in_at),
      requested_clock_out_at: correctionForm.requested_clock_out_at
        ? normalizeDateTimePayload(correctionForm.requested_clock_out_at)
        : undefined,
      reason: correctionForm.reason,
    }

    correctionMutation.mutate(payload)
  }

  const handleShiftSubmit = () => {
    const payload: AttendanceShiftPayload = {
      code: shiftForm.code,
      name: shiftForm.name,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      grace_minutes: Number(shiftForm.grace_minutes || '0'),
      requires_gps: shiftForm.requires_gps,
      requires_photo: shiftForm.requires_photo,
      requires_qr: shiftForm.requires_qr,
      latitude: parseOptionalNumber(shiftForm.latitude),
      longitude: parseOptionalNumber(shiftForm.longitude),
      radius_meters: parseOptionalNumber(shiftForm.radius_meters),
      qr_token: shiftForm.qr_token || undefined,
      is_active: shiftForm.is_active,
    }

    shiftMutation.mutate(payload)
  }

  const handleAssignmentSubmit = () => {
    if (!assignmentForm.employee_id || !assignmentForm.shift_id) {
      return
    }

    assignmentMutation.mutate({
      employee_id: Number(assignmentForm.employee_id),
      shift_id: Number(assignmentForm.shift_id),
      start_date: assignmentForm.start_date,
      end_date: assignmentForm.end_date || undefined,
    })
  }

  const handleHolidaySubmit = () => {
    const payload: AttendanceHolidayPayload = {
      name: holidayForm.name,
      holiday_date: holidayForm.holiday_date,
      type: holidayForm.type,
      notes: holidayForm.notes || undefined,
    }

    holidayMutation.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <Card className="hero-panel">
        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
                Attendance Command Center
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <Clock3 className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
                Clock, approval, and report
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                Waktu kerja, geofence, correction, dan laporan hadir di satu ruang.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
                Modul attendance ini menyatukan clock in/out, validasi GPS dan photo,
                QR attendance, manual backfill, approval correction, shift, holiday,
                serta laporan yang langsung nyambung ke struktur employee dan manager yang ada.
              </CardDescription>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={ClipboardCheck}
              label="Records This Month"
              value={String(overviewQuery.data?.stats.records_this_month ?? 0)}
            />
            <MetricCard
              icon={Clock3}
              label="Late Cases"
              value={String(overviewQuery.data?.stats.late_records_this_month ?? 0)}
            />
            <MetricCard
              icon={ShieldCheck}
              label="Pending Approvals"
              value={String(overviewQuery.data?.stats.pending_approvals ?? 0)}
            />
            <MetricCard
              icon={CalendarDays}
              label="Overtime"
              value={formatMinutes(overviewQuery.data?.stats.overtime_minutes_this_month ?? 0)}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Clock Station</div>
            <CardTitle className="pt-3 text-2xl">Clock in dan clock out dengan validasi shift</CardTitle>
            <CardDescription>
              Gunakan titik GPS, photo evidence, dan QR token dari shift aktif untuk merekam kehadiran hari ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="stat-card">
                <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Today</p>
                <p className="mt-3 text-xl font-bold">{overviewQuery.data?.today.date ?? todayString()}</p>
                <p className="mt-2 text-sm text-app-muted-foreground">
                  {overviewQuery.data?.today.employee?.full_name ?? session?.user.name}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Active Shift</p>
                <p className="mt-3 text-xl font-bold">{todaysShift?.name ?? 'No shift'}</p>
                <p className="mt-2 text-sm text-app-muted-foreground">
                  {todaysShift ? `${todaysShift.start_time} - ${todaysShift.end_time}` : 'Assign a shift first'}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Current Record</p>
                <div className="mt-3">
                  <Badge variant={getStatusVariant(todaysRecord?.status)}>
                    {formatStatus(todaysRecord?.status ?? 'incomplete')}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-app-muted-foreground">
                  {todaysRecord?.clock_in_at ? `In ${formatDateTime(todaysRecord.clock_in_at)}` : 'No clock in yet'}
                </p>
              </div>
              <div className="stat-card">
                <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Holiday / Weekend</p>
                <p className="mt-3 text-xl font-bold">
                  {overviewQuery.data?.today.holiday?.name ?? (todaysRecord?.is_weekend ? 'Weekend' : 'Working Day')}
                </p>
                <p className="mt-2 text-sm text-app-muted-foreground">
                  {overviewQuery.data?.today.holiday?.type ?? (todaysRecord?.is_weekend ? 'Weekend attendance' : 'Normal schedule')}
                </p>
              </div>
            </div>

            {todaysShift ? (
              <div className="data-row px-5 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={todaysShift.requires_gps ? 'warning' : 'neutral'}>
                    GPS {todaysShift.requires_gps ? 'required' : 'optional'}
                  </Badge>
                  <Badge variant={todaysShift.requires_photo ? 'warning' : 'neutral'}>
                    Photo {todaysShift.requires_photo ? 'required' : 'optional'}
                  </Badge>
                  <Badge variant={todaysShift.requires_qr ? 'warning' : 'neutral'}>
                    QR {todaysShift.requires_qr ? 'required' : 'optional'}
                  </Badge>
                  {todaysShift.radius_meters ? (
                    <Badge variant="neutral">{todaysShift.radius_meters} m radius</Badge>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-app-muted-foreground">
                  QR token active untuk demo shift ini:
                  {' '}
                  <span className="font-mono text-app-foreground">{todaysShift.qr_token ?? 'not set'}</span>
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="attendance-latitude">Latitude</Label>
                <input
                  className="field-select"
                  id="attendance-latitude"
                  onChange={(event) => setClockForm((current) => ({ ...current, latitude: event.currentTarget.value }))}
                  placeholder="-6.2240937"
                  value={clockForm.latitude}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-longitude">Longitude</Label>
                <input
                  className="field-select"
                  id="attendance-longitude"
                  onChange={(event) => setClockForm((current) => ({ ...current, longitude: event.currentTarget.value }))}
                  placeholder="106.8091178"
                  value={clockForm.longitude}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-qr-token">QR Token / Scan Result</Label>
                <input
                  className="field-select"
                  id="attendance-qr-token"
                  onChange={(event) => setClockForm((current) => ({ ...current, qr_token: event.currentTarget.value }))}
                  placeholder="OFFICE-JKT-QR"
                  value={clockForm.qr_token}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-photo">Photo Validation</Label>
                <input
                  accept="image/*"
                  className="field-select"
                  id="attendance-photo"
                  onChange={(event) => setClockForm((current) => ({ ...current, photo: event.currentTarget.files?.[0] ?? null }))}
                  type="file"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance-clock-notes">Notes</Label>
              <textarea
                className="field-area min-h-28"
                id="attendance-clock-notes"
                onChange={(event) => setClockForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                placeholder="Optional note for attendance evidence or field remarks."
                value={clockForm.notes}
              />
            </div>

            {clockInMutation.isError ? (
              <p className="text-sm text-rose-600">{getErrorMessage(clockInMutation.error)}</p>
            ) : null}

            {clockOutMutation.isError ? (
              <p className="text-sm text-rose-600">{getErrorMessage(clockOutMutation.error)}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={!canClock || clockInMutation.isPending || Boolean(todaysRecord?.clock_in_at)}
                onClick={() => handleClockAction('in')}
                type="button"
              >
                <MapPin className="h-4 w-4" />
                {clockInMutation.isPending ? 'Clocking In...' : 'Clock In'}
              </Button>
              <Button
                disabled={!canClock || clockOutMutation.isPending || !isClockOutReady}
                onClick={() => handleClockAction('out')}
                type="button"
                variant="secondary"
              >
                <QrCode className="h-4 w-4" />
                {clockOutMutation.isPending ? 'Clocking Out...' : 'Clock Out'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Correction Flow</div>
            <CardTitle className="pt-3 text-2xl">Correction request dan jejak approval</CardTitle>
            <CardDescription>
              Employee bisa mengajukan pembetulan jam masuk atau pulang, lalu manager atau approver yang ditunjuk meninjaunya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {canCreateCorrection ? (
              <div className="space-y-4 rounded-[28px] border border-app-border bg-white/75 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="correction-record">Attendance Record</Label>
                    <select
                      className="field-select"
                      id="correction-record"
                      onChange={(event) => handleCorrectionRecordChange(event.currentTarget.value)}
                      value={correctionForm.attendance_record_id}
                    >
                      <option value="">Select attendance record</option>
                      {visibleRecords.map((record) => (
                        <option key={record.id} value={record.id}>
                          {record.attendance_date}
                          {' • '}
                          {record.employee?.full_name ?? 'Unknown'}
                          {' • '}
                          {formatStatus(record.status)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correction-date">Attendance Date</Label>
                    <input
                      className="field-select"
                      id="correction-date"
                      onChange={(event) => setCorrectionForm((current) => ({ ...current, attendance_date: event.currentTarget.value }))}
                      type="date"
                      value={correctionForm.attendance_date}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correction-clock-in">Requested Clock In</Label>
                    <input
                      className="field-select"
                      id="correction-clock-in"
                      onChange={(event) => setCorrectionForm((current) => ({ ...current, requested_clock_in_at: event.currentTarget.value }))}
                      type="datetime-local"
                      value={correctionForm.requested_clock_in_at}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="correction-clock-out">Requested Clock Out</Label>
                    <input
                      className="field-select"
                      id="correction-clock-out"
                      onChange={(event) => setCorrectionForm((current) => ({ ...current, requested_clock_out_at: event.currentTarget.value }))}
                      type="datetime-local"
                      value={correctionForm.requested_clock_out_at}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="correction-reason">Reason</Label>
                    <textarea
                      className="field-area min-h-28"
                      id="correction-reason"
                      onChange={(event) => setCorrectionForm((current) => ({ ...current, reason: event.currentTarget.value }))}
                      placeholder="Explain why the original attendance time needs correction."
                      value={correctionForm.reason}
                    />
                  </div>
                </div>

                {selectedCorrectionRecord ? (
                  <div className="rounded-[24px] border border-dashed border-app-border px-4 py-4 text-sm text-app-muted-foreground">
                    Current record:
                    {' '}
                    {selectedCorrectionRecord.clock_in_at ? formatDateTime(selectedCorrectionRecord.clock_in_at) : 'No clock in'}
                    {' • '}
                    {selectedCorrectionRecord.clock_out_at ? formatDateTime(selectedCorrectionRecord.clock_out_at) : 'No clock out'}
                  </div>
                ) : null}

                {correctionMutation.isError ? (
                  <p className="text-sm text-rose-600">{getErrorMessage(correctionMutation.error)}</p>
                ) : null}

                <Button
                  disabled={correctionMutation.isPending || !correctionForm.attendance_record_id}
                  onClick={handleCorrectionSubmit}
                  type="button"
                >
                  <FileText className="h-4 w-4" />
                  {correctionMutation.isPending ? 'Submitting...' : 'Submit Correction'}
                </Button>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                <p className="text-lg font-semibold">Correction request disabled for this role</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Riwayat correction tetap bisa dipantau jika role Anda punya akses view attendance.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">Correction History</h3>
                <Badge variant="neutral">{correctionsQuery.data?.length ?? 0} items</Badge>
              </div>

              {correctionsQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading corrections...</p>
              ) : null}

              {!correctionsQuery.isLoading && correctionsQuery.data?.map((correction) => (
                <article className="data-row px-5 py-5" key={correction.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">
                          {correction.employee?.full_name ?? 'Unknown employee'}
                        </p>
                        <Badge variant={getStatusVariant(correction.status)}>
                          {formatStatus(correction.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-app-muted-foreground">
                        {correction.requested_attendance_date}
                        {' • '}
                        {correction.attendance_record?.shift?.name ?? 'No shift'}
                      </p>
                      <p className="mt-1 text-sm text-app-muted-foreground">
                        Requested:
                        {' '}
                        {correction.requested_clock_in_at ? formatDateTime(correction.requested_clock_in_at) : 'No clock in'}
                        {' • '}
                        {correction.requested_clock_out_at ? formatDateTime(correction.requested_clock_out_at) : 'No clock out'}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                      Approver:
                      {' '}
                      <span className="font-medium text-app-foreground">
                        {correction.approver?.name ?? 'Unassigned'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-app-foreground">{correction.reason}</p>
                  {correction.remarks ? (
                    <p className="mt-3 text-sm text-app-muted-foreground">
                      Remarks:
                      {' '}
                      {correction.remarks}
                    </p>
                  ) : null}
                </article>
              ))}

              {!correctionsQuery.isLoading && correctionsQuery.data?.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                  <p className="text-lg font-semibold">No attendance corrections yet</p>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    Correction requests will appear here after the first submission.
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="section-kicker w-fit">Attendance Report</div>
          <CardTitle className="pt-3 text-2xl">Report, filter, dan history kehadiran</CardTitle>
          <CardDescription>
            Lihat keterlambatan, overtime, holiday, weekend, dan detail evidence per record dengan filter yang bisa dipakai lintas role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-start-date">Start Date</Label>
              <input
                className="field-select"
                id="report-start-date"
                onChange={(event) => setReportFilters((current) => ({ ...current, start_date: event.currentTarget.value }))}
                type="date"
                value={reportFilters.start_date ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-end-date">End Date</Label>
              <input
                className="field-select"
                id="report-end-date"
                onChange={(event) => setReportFilters((current) => ({ ...current, end_date: event.currentTarget.value }))}
                type="date"
                value={reportFilters.end_date ?? ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-status">Status</Label>
              <select
                className="field-select"
                id="report-status"
                onChange={(event) => setReportFilters((current) => ({ ...current, status: event.currentTarget.value }))}
                value={reportFilters.status ?? ''}
              >
                <option value="">All statuses</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="manual">Manual</option>
                <option value="corrected">Corrected</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="report-employee">Employee</Label>
              <select
                className="field-select"
                id="report-employee"
                onChange={(event) => setReportFilters((current) => ({ ...current, employee_id: parseOptionalNumber(event.currentTarget.value) }))}
                value={reportFilters.employee_id ? String(reportFilters.employee_id) : ''}
              >
                <option value="">All visible employees</option>
                {lookupsQuery.data?.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.full_name}
                    {' • '}
                    {employee.employee_number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
              <input
                checked={Boolean(reportFilters.late_only)}
                onChange={(event) => setReportFilters((current) => ({ ...current, late_only: event.currentTarget.checked }))}
                type="checkbox"
              />
              Late only
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
              <input
                checked={Boolean(reportFilters.weekend_only)}
                onChange={(event) => setReportFilters((current) => ({ ...current, weekend_only: event.currentTarget.checked }))}
                type="checkbox"
              />
              Weekend only
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
              <input
                checked={Boolean(reportFilters.holiday_only)}
                onChange={(event) => setReportFilters((current) => ({ ...current, holiday_only: event.currentTarget.checked }))}
                type="checkbox"
              />
              Holiday only
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="stat-card">
              <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Visible Records</p>
              <p className="mt-3 text-3xl font-bold">{reportQuery.data?.summary.total_records ?? 0}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Late Records</p>
              <p className="mt-3 text-3xl font-bold">{reportQuery.data?.summary.late_records ?? 0}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Worked Minutes</p>
              <p className="mt-3 text-3xl font-bold">{formatMinutes(reportQuery.data?.summary.worked_minutes ?? 0)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs uppercase tracking-[0.18em] text-app-muted-foreground">Overtime</p>
              <p className="mt-3 text-3xl font-bold">{formatMinutes(reportQuery.data?.summary.overtime_minutes ?? 0)}</p>
            </div>
          </div>

          {reportQuery.isLoading ? (
            <p className="text-sm text-app-muted-foreground">Loading attendance report...</p>
          ) : null}

          {!reportQuery.isLoading && reportQuery.data?.records.map((record) => (
            <article className="data-row px-5 py-5" key={record.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold">{record.employee?.full_name ?? 'Unknown employee'}</p>
                    <Badge variant={getStatusVariant(record.status)}>
                      {formatStatus(record.status)}
                    </Badge>
                    {record.is_weekend ? <Badge variant="neutral">Weekend</Badge> : null}
                    {record.is_holiday ? <Badge variant="warning">Holiday</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm text-app-muted-foreground">
                    {record.employee?.employee_number ?? 'N/A'}
                    {' • '}
                    {record.employee?.department ?? 'No department'}
                    {' • '}
                    {record.shift?.name ?? 'No shift'}
                  </p>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    {record.clock_in_at ? formatDateTime(record.clock_in_at) : 'No clock in'}
                    {' • '}
                    {record.clock_out_at ? formatDateTime(record.clock_out_at) : 'No clock out'}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                  <p>Worked: <span className="font-medium text-app-foreground">{formatMinutes(record.worked_minutes)}</span></p>
                  <p className="mt-1">Late: <span className="font-medium text-app-foreground">{formatMinutes(record.late_minutes)}</span></p>
                  <p className="mt-1">OT: <span className="font-medium text-app-foreground">{formatMinutes(record.overtime_minutes)}</span></p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {record.shift?.requires_gps ? (
                  <Badge variant="neutral">
                    GPS {record.clock_in_latitude && record.clock_in_longitude ? 'captured' : 'missing'}
                  </Badge>
                ) : null}
                {record.shift?.requires_photo ? (
                  <Badge variant={record.clock_in_photo_url || record.clock_out_photo_url ? 'success' : 'warning'}>
                    Photo evidence
                  </Badge>
                ) : null}
                {record.shift?.requires_qr ? (
                  <Badge variant={record.clock_in_source === 'qr' || record.clock_out_source === 'qr' ? 'success' : 'warning'}>
                    QR attendance
                  </Badge>
                ) : null}
              </div>

              {record.notes ? (
                <p className="mt-4 text-sm leading-7 text-app-foreground">{record.notes}</p>
              ) : null}
            </article>
          ))}

          {!reportQuery.isLoading && reportQuery.data?.records.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
              <p className="text-lg font-semibold">No attendance records in this filter</p>
              <p className="mt-1 text-sm text-app-muted-foreground">
                Ubah rentang tanggal atau filter status untuk melihat data lain.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canApprove ? (
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Approval Inbox</div>
            <CardTitle className="pt-3 text-2xl">Correction approval yang menunggu keputusan</CardTitle>
            <CardDescription>
              Approver dapat menyetujui atau menolak koreksi attendance beserta remark audit trail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalsQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading approval inbox...</p>
            ) : null}

            {!approvalsQuery.isLoading && approvalsQuery.data?.map((correction) => (
              <article className="data-row px-5 py-5" key={correction.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">
                        {correction.employee?.full_name ?? 'Unknown employee'}
                      </p>
                      <Badge variant={getStatusVariant(correction.status)}>
                        {formatStatus(correction.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      Current:
                      {' '}
                      {correction.attendance_record?.clock_in_at ? formatDateTime(correction.attendance_record.clock_in_at) : 'No clock in'}
                      {' • '}
                      {correction.attendance_record?.clock_out_at ? formatDateTime(correction.attendance_record.clock_out_at) : 'No clock out'}
                    </p>
                    <p className="mt-1 text-sm text-app-muted-foreground">
                      Requested:
                      {' '}
                      {correction.requested_clock_in_at ? formatDateTime(correction.requested_clock_in_at) : 'No clock in'}
                      {' • '}
                      {correction.requested_clock_out_at ? formatDateTime(correction.requested_clock_out_at) : 'No clock out'}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-app-foreground">{correction.reason}</p>
                  </div>

                  <div className="w-full max-w-md space-y-3 rounded-[24px] border border-app-border bg-white/72 p-4">
                    <Label htmlFor={`approval-note-${correction.id}`}>Approval Remark</Label>
                    <textarea
                      className="field-area min-h-24"
                      id={`approval-note-${correction.id}`}
                      onChange={(event) => setApprovalNotes((current) => ({
                        ...current,
                        [correction.id]: event.currentTarget.value,
                      }))}
                      placeholder="Optional approval or rejection note."
                      value={approvalNotes[correction.id] ?? ''}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={approveMutation.isPending}
                        onClick={() => approveMutation.mutate({
                          correctionId: correction.id,
                          remarks: approvalNotes[correction.id],
                        })}
                        type="button"
                      >
                        <ClipboardCheck className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        disabled={rejectMutation.isPending || !(approvalNotes[correction.id] ?? '').trim()}
                        onClick={() => rejectMutation.mutate({
                          correctionId: correction.id,
                          remarks: approvalNotes[correction.id] ?? '',
                        })}
                        type="button"
                        variant="secondary"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {approveMutation.isError ? (
              <p className="text-sm text-rose-600">{getErrorMessage(approveMutation.error)}</p>
            ) : null}

            {rejectMutation.isError ? (
              <p className="text-sm text-rose-600">{getErrorMessage(rejectMutation.error)}</p>
            ) : null}

            {!approvalsQuery.isLoading && approvalsQuery.data?.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                <p className="text-lg font-semibold">No pending approvals</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Semua correction request yang ditugaskan ke role ini sudah selesai diproses.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {canManual || canManage ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {canManual ? (
            <Card>
              <CardHeader>
                <div className="section-kicker w-fit">Manual Attendance</div>
                <CardTitle className="pt-3 text-2xl">Backfill attendance untuk kasus manual</CardTitle>
                <CardDescription>
                  Cocok untuk correction operasional, weekend support, atau input attendance dari register offline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="manual-employee">Employee</Label>
                    <select
                      className="field-select"
                      id="manual-employee"
                      onChange={(event) => setManualForm((current) => ({ ...current, employee_id: event.currentTarget.value }))}
                      value={manualForm.employee_id}
                    >
                      <option value="">Select employee</option>
                      {lookupsQuery.data?.employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name}
                          {' • '}
                          {employee.employee_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-attendance-date">Attendance Date</Label>
                    <input
                      className="field-select"
                      id="manual-attendance-date"
                      onChange={(event) => setManualForm((current) => ({ ...current, attendance_date: event.currentTarget.value }))}
                      type="date"
                      value={manualForm.attendance_date}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-shift">Shift</Label>
                    <select
                      className="field-select"
                      id="manual-shift"
                      onChange={(event) => setManualForm((current) => ({ ...current, shift_id: event.currentTarget.value }))}
                      value={manualForm.shift_id}
                    >
                      <option value="">Auto resolve shift</option>
                      {shiftsQuery.data?.map((shift) => (
                        <option key={shift.id} value={shift.id}>
                          {shift.name}
                          {' • '}
                          {shift.start_time} - {shift.end_time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-clock-in-at">Clock In</Label>
                    <input
                      className="field-select"
                      id="manual-clock-in-at"
                      onChange={(event) => setManualForm((current) => ({ ...current, clock_in_at: event.currentTarget.value }))}
                      type="datetime-local"
                      value={manualForm.clock_in_at}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-clock-out-at">Clock Out</Label>
                    <input
                      className="field-select"
                      id="manual-clock-out-at"
                      onChange={(event) => setManualForm((current) => ({ ...current, clock_out_at: event.currentTarget.value }))}
                      type="datetime-local"
                      value={manualForm.clock_out_at}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-clock-in-photo">Clock In Photo</Label>
                    <input
                      accept="image/*"
                      className="field-select"
                      id="manual-clock-in-photo"
                      onChange={(event) => setManualForm((current) => ({
                        ...current,
                        clock_in_photo: event.currentTarget.files?.[0] ?? null,
                      }))}
                      type="file"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="manual-clock-out-photo">Clock Out Photo</Label>
                    <input
                      accept="image/*"
                      className="field-select"
                      id="manual-clock-out-photo"
                      onChange={(event) => setManualForm((current) => ({
                        ...current,
                        clock_out_photo: event.currentTarget.files?.[0] ?? null,
                      }))}
                      type="file"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="manual-notes">Notes</Label>
                    <textarea
                      className="field-area min-h-28"
                      id="manual-notes"
                      onChange={(event) => setManualForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                      placeholder="Explain why this attendance is being backfilled manually."
                      value={manualForm.notes}
                    />
                  </div>
                </div>

                {manualMutation.isError ? (
                  <p className="text-sm text-rose-600">{getErrorMessage(manualMutation.error)}</p>
                ) : null}

                <Button
                  disabled={manualMutation.isPending || !manualForm.employee_id}
                  onClick={handleManualSubmit}
                  type="button"
                >
                  <Users className="h-4 w-4" />
                  {manualMutation.isPending ? 'Saving...' : 'Save Manual Attendance'}
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {canManage ? (
            <Card>
              <CardHeader>
                <div className="section-kicker w-fit">Shift and Holiday Setup</div>
                <CardTitle className="pt-3 text-2xl">Shift, assignment, dan holiday configuration</CardTitle>
                <CardDescription>
                  Atur pola waktu kerja, geofence, QR token, assignment karyawan, dan kalender hari libur untuk modul attendance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 rounded-[28px] border border-app-border bg-white/75 p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="shift-code">Shift Code</Label>
                      <input
                        className="field-select"
                        id="shift-code"
                        onChange={(event) => setShiftForm((current) => ({ ...current, code: event.currentTarget.value }))}
                        placeholder="OFFICE-JKT"
                        value={shiftForm.code}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-name">Shift Name</Label>
                      <input
                        className="field-select"
                        id="shift-name"
                        onChange={(event) => setShiftForm((current) => ({ ...current, name: event.currentTarget.value }))}
                        placeholder="Jakarta Office Shift"
                        value={shiftForm.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-start-time">Start Time</Label>
                      <input
                        className="field-select"
                        id="shift-start-time"
                        onChange={(event) => setShiftForm((current) => ({ ...current, start_time: event.currentTarget.value }))}
                        type="time"
                        value={shiftForm.start_time}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-end-time">End Time</Label>
                      <input
                        className="field-select"
                        id="shift-end-time"
                        onChange={(event) => setShiftForm((current) => ({ ...current, end_time: event.currentTarget.value }))}
                        type="time"
                        value={shiftForm.end_time}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-grace-minutes">Grace Minutes</Label>
                      <input
                        className="field-select"
                        id="shift-grace-minutes"
                        onChange={(event) => setShiftForm((current) => ({ ...current, grace_minutes: event.currentTarget.value }))}
                        type="number"
                        value={shiftForm.grace_minutes}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-qr-token">QR Token</Label>
                      <input
                        className="field-select"
                        id="shift-qr-token"
                        onChange={(event) => setShiftForm((current) => ({ ...current, qr_token: event.currentTarget.value }))}
                        placeholder="OFFICE-JKT-QR"
                        value={shiftForm.qr_token}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-latitude">Latitude</Label>
                      <input
                        className="field-select"
                        id="shift-latitude"
                        onChange={(event) => setShiftForm((current) => ({ ...current, latitude: event.currentTarget.value }))}
                        placeholder="-6.2240937"
                        value={shiftForm.latitude}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift-longitude">Longitude</Label>
                      <input
                        className="field-select"
                        id="shift-longitude"
                        onChange={(event) => setShiftForm((current) => ({ ...current, longitude: event.currentTarget.value }))}
                        placeholder="106.8091178"
                        value={shiftForm.longitude}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="shift-radius">Radius Meters</Label>
                      <input
                        className="field-select"
                        id="shift-radius"
                        onChange={(event) => setShiftForm((current) => ({ ...current, radius_meters: event.currentTarget.value }))}
                        placeholder="350"
                        type="number"
                        value={shiftForm.radius_meters}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
                      <input
                        checked={shiftForm.requires_gps}
                        onChange={(event) => setShiftForm((current) => ({ ...current, requires_gps: event.currentTarget.checked }))}
                        type="checkbox"
                      />
                      Requires GPS
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
                      <input
                        checked={shiftForm.requires_photo}
                        onChange={(event) => setShiftForm((current) => ({ ...current, requires_photo: event.currentTarget.checked }))}
                        type="checkbox"
                      />
                      Requires photo
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
                      <input
                        checked={shiftForm.requires_qr}
                        onChange={(event) => setShiftForm((current) => ({ ...current, requires_qr: event.currentTarget.checked }))}
                        type="checkbox"
                      />
                      Requires QR
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm text-app-muted-foreground">
                      <input
                        checked={shiftForm.is_active}
                        onChange={(event) => setShiftForm((current) => ({ ...current, is_active: event.currentTarget.checked }))}
                        type="checkbox"
                      />
                      Active shift
                    </label>
                  </div>

                  {shiftMutation.isError ? (
                    <p className="text-sm text-rose-600">{getErrorMessage(shiftMutation.error)}</p>
                  ) : null}

                  <Button
                    disabled={shiftMutation.isPending || !shiftForm.code || !shiftForm.name}
                    onClick={handleShiftSubmit}
                    type="button"
                  >
                    <Clock3 className="h-4 w-4" />
                    {shiftMutation.isPending ? 'Saving shift...' : 'Save Shift'}
                  </Button>
                </div>

                <div className="space-y-4 rounded-[28px] border border-app-border bg-white/75 p-5">
                  <h3 className="text-lg font-semibold">Assign Shift</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="assignment-employee">Employee</Label>
                      <select
                        className="field-select"
                        id="assignment-employee"
                        onChange={(event) => setAssignmentForm((current) => ({ ...current, employee_id: event.currentTarget.value }))}
                        value={assignmentForm.employee_id}
                      >
                        <option value="">Select employee</option>
                        {lookupsQuery.data?.employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name}
                            {' • '}
                            {employee.employee_number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="assignment-shift">Shift</Label>
                      <select
                        className="field-select"
                        id="assignment-shift"
                        onChange={(event) => setAssignmentForm((current) => ({ ...current, shift_id: event.currentTarget.value }))}
                        value={assignmentForm.shift_id}
                      >
                        <option value="">Select shift</option>
                        {shiftsQuery.data?.map((shift) => (
                          <option key={shift.id} value={shift.id}>
                            {shift.name}
                            {' • '}
                            {shift.start_time} - {shift.end_time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignment-start-date">Start Date</Label>
                      <input
                        className="field-select"
                        id="assignment-start-date"
                        onChange={(event) => setAssignmentForm((current) => ({ ...current, start_date: event.currentTarget.value }))}
                        type="date"
                        value={assignmentForm.start_date}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignment-end-date">End Date</Label>
                      <input
                        className="field-select"
                        id="assignment-end-date"
                        onChange={(event) => setAssignmentForm((current) => ({ ...current, end_date: event.currentTarget.value }))}
                        type="date"
                        value={assignmentForm.end_date}
                      />
                    </div>
                  </div>

                  {assignmentMutation.isError ? (
                    <p className="text-sm text-rose-600">{getErrorMessage(assignmentMutation.error)}</p>
                  ) : null}

                  <Button
                    disabled={assignmentMutation.isPending || !assignmentForm.employee_id || !assignmentForm.shift_id}
                    onClick={handleAssignmentSubmit}
                    type="button"
                    variant="secondary"
                  >
                    <Users className="h-4 w-4" />
                    {assignmentMutation.isPending ? 'Assigning...' : 'Assign Shift'}
                  </Button>
                </div>

                <div className="space-y-4 rounded-[28px] border border-app-border bg-white/75 p-5">
                  <h3 className="text-lg font-semibold">Holiday Setup</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="holiday-name">Holiday Name</Label>
                      <input
                        className="field-select"
                        id="holiday-name"
                        onChange={(event) => setHolidayForm((current) => ({ ...current, name: event.currentTarget.value }))}
                        placeholder="Independence Day"
                        value={holidayForm.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holiday-date">Holiday Date</Label>
                      <input
                        className="field-select"
                        id="holiday-date"
                        onChange={(event) => setHolidayForm((current) => ({ ...current, holiday_date: event.currentTarget.value }))}
                        type="date"
                        value={holidayForm.holiday_date}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="holiday-type">Type</Label>
                      <select
                        className="field-select"
                        id="holiday-type"
                        onChange={(event) => setHolidayForm((current) => ({ ...current, type: event.currentTarget.value }))}
                        value={holidayForm.type}
                      >
                        <option value="public">Public</option>
                        <option value="religious">Religious</option>
                        <option value="company">Company</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="holiday-notes">Notes</Label>
                      <textarea
                        className="field-area min-h-24"
                        id="holiday-notes"
                        onChange={(event) => setHolidayForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                        placeholder="Optional notes for this holiday."
                        value={holidayForm.notes}
                      />
                    </div>
                  </div>

                  {holidayMutation.isError ? (
                    <p className="text-sm text-rose-600">{getErrorMessage(holidayMutation.error)}</p>
                  ) : null}

                  <Button
                    disabled={holidayMutation.isPending || !holidayForm.name}
                    onClick={handleHolidaySubmit}
                    type="button"
                  >
                    <CalendarDays className="h-4 w-4" />
                    {holidayMutation.isPending ? 'Saving holiday...' : 'Save Holiday'}
                  </Button>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">Shift List</h3>
                      <Badge variant="neutral">{shiftsQuery.data?.length ?? 0} shifts</Badge>
                    </div>
                    {shiftsQuery.data?.map((shift) => (
                      <article className="data-row px-5 py-5" key={shift.id}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{shift.name}</p>
                          <Badge variant={shift.is_active ? 'success' : 'neutral'}>
                            {shift.is_active ? 'active' : 'inactive'}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-app-muted-foreground">
                          {shift.code}
                          {' • '}
                          {shift.start_time} - {shift.end_time}
                          {' • '}
                          {shift.assignments_count ?? 0} assignments
                        </p>
                      </article>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold">Holiday List</h3>
                      <Badge variant="neutral">{holidaysQuery.data?.length ?? 0} holidays</Badge>
                    </div>
                    {holidaysQuery.data?.map((holiday) => (
                      <article className="data-row px-5 py-5" key={holiday.id}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{holiday.name}</p>
                          <Badge variant="warning">{holiday.type}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-app-muted-foreground">
                          {holiday.holiday_date}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ClipboardCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">{label}</p>
        <Icon className="h-4 w-4 text-[color:var(--app-highlight)]" />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function firstDayOfCurrentMonth() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

function todayString() {
  const date = new Date()
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

function normalizeDateTimePayload(value: string) {
  return value.replace('T', ' ')
}

function stringifyNullableNumber(value: number | null | undefined) {
  return value === null || value === undefined ? '' : String(value)
}

function parseOptionalNumber(value: string | number | undefined) {
  if (value === undefined || value === '') {
    return undefined
  }

  return Number(value)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return '0m'
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getStatusVariant(status: string | undefined) {
  return statusVariantMap[status as keyof typeof statusVariantMap] ?? 'neutral'
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
    + `T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function normalizeReportFilters(filters: AttendanceReportFilters) {
  return Object.entries(filters).reduce<AttendanceReportFilters>((current, [key, value]) => {
    if (value === '' || value === undefined || value === false) {
      return current
    }

    return {
      ...current,
      [key]: value,
    }
  }, {})
}
