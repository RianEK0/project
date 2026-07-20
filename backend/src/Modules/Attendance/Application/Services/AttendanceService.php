<?php

namespace Modules\Attendance\Application\Services;

use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceCorrection;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceHoliday;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceRecord;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceShift;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceShiftAssignment;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\ListQueryOptions;

class AttendanceService
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor): array
    {
        $today = Carbon::today();
        $employee = $actor->employee()->with(['branch', 'department'])->first();
        $todayRecord = $employee
            ? AttendanceRecord::query()
                ->with($this->recordRelations())
                ->where('employee_id', $employee->id)
                ->whereDate('attendance_date', $today)
                ->first()
            : null;
        $todayShift = $employee ? $this->resolveAssignedShift($employee, $today) : null;
        $todayHoliday = $this->resolveHoliday($today);
        $monthQuery = $this->applyRecordFilters(
            $this->visibleRecordsQuery($actor),
            [
                'start_date' => $today->copy()->startOfMonth()->toDateString(),
                'end_date' => $today->copy()->endOfMonth()->toDateString(),
            ],
        );

        return [
            'today' => [
                'date' => $today->toDateString(),
                'employee' => $employee,
                'shift' => $todayShift,
                'record' => $todayRecord,
                'holiday' => $todayHoliday,
            ],
            'stats' => [
                'records_this_month' => (clone $monthQuery)->count(),
                'late_records_this_month' => (clone $monthQuery)->where('is_late', true)->count(),
                'overtime_minutes_this_month' => (clone $monthQuery)->sum('overtime_minutes'),
                'weekend_records_this_month' => (clone $monthQuery)->where('is_weekend', true)->count(),
                'holiday_records_this_month' => (clone $monthQuery)->where('is_holiday', true)->count(),
                'pending_corrections' => $this->visibleCorrectionsQuery($actor)->where('status', 'pending')->count(),
                'pending_approvals' => $this->approvalInboxQuery($actor)->count(),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(User $actor): array
    {
        $employee = $actor->employee()->first();
        $canSeeAllEmployees = $this->canSeeAllEmployees($actor);
        $employees = Employee::query()
            ->with(['branch', 'department'])
            ->when(
                ! $canSeeAllEmployees,
                static fn (Builder $query) => $employee
                    ? $query->whereKey($employee->id)
                    : $query->whereRaw('1 = 0'),
            )
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        $shifts = AttendanceShift::query()
            ->withCount('assignments')
            ->orderBy('name')
            ->get();

        return [
            'employees' => $employees,
            'shifts' => $shifts,
            'holidays' => AttendanceHoliday::query()
                ->orderBy('holiday_date')
                ->get(),
            'today' => [
                'date' => Carbon::today()->toDateString(),
                'shift' => $employee ? $this->resolveAssignedShift($employee, Carbon::today()) : null,
                'record' => $employee
                    ? AttendanceRecord::query()
                        ->with($this->recordRelations())
                        ->where('employee_id', $employee->id)
                        ->whereDate('attendance_date', Carbon::today())
                        ->first()
                    : null,
            ],
        ];
    }

    public function records(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->applyRecordSorting(
            $this->recordListingQuery($actor, $query)
                ->with($this->recordRelations()),
            $query,
        )
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return array<string, mixed>
     */
    public function report(User $actor, ListQueryOptions $query): array
    {
        $recordsQuery = $this->recordListingQuery($actor, $query);
        $records = $this->applyRecordSorting(
            (clone $recordsQuery)->with($this->recordRelations()),
            $query,
        )->paginate($query->perPage, ['*'], 'page', $query->page);

        return [
            'summary' => [
                'total_records' => (clone $recordsQuery)->count(),
                'present_records' => (clone $recordsQuery)->whereIn('status', ['present', 'late', 'manual', 'corrected'])->count(),
                'late_records' => (clone $recordsQuery)->where('is_late', true)->count(),
                'overtime_minutes' => (clone $recordsQuery)->sum('overtime_minutes'),
                'worked_minutes' => (clone $recordsQuery)->sum('worked_minutes'),
                'weekend_records' => (clone $recordsQuery)->where('is_weekend', true)->count(),
                'holiday_records' => (clone $recordsQuery)->where('is_holiday', true)->count(),
                'pending_corrections' => $this->visibleCorrectionsQuery($actor)->where('status', 'pending')->count(),
            ],
            'records' => $records,
        ];
    }

    /**
     * @return LengthAwarePaginator<int, AttendanceCorrection>
     */
    public function corrections(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->applyCorrectionSorting(
            $this->correctionListingQuery($this->visibleCorrectionsQuery($actor), $query)
                ->with($this->correctionRelations()),
            $query,
        )->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return LengthAwarePaginator<int, AttendanceCorrection>
     */
    public function approvalInbox(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->applyCorrectionSorting(
            $this->correctionListingQuery($this->approvalInboxQuery($actor), $query)
                ->with($this->correctionRelations()),
            $query,
        )->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return LengthAwarePaginator<int, AttendanceShift>
     */
    public function shifts(ListQueryOptions $query): LengthAwarePaginator
    {
        return AttendanceShift::query()
            ->withCount('assignments')
            ->when(
                filled($query->filter('is_active')),
                static fn (Builder $builder) => $builder->where('is_active', filter_var($query->filter('is_active'), FILTER_VALIDATE_BOOLEAN)),
            )
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', static fn (Builder $builder) => $builder->orderBy('name')->orderBy('id'), function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'start_time' => $builder->orderBy('start_time', $query->sortDirection)->orderBy('id', $query->sortDirection),
                    'end_time' => $builder->orderBy('end_time', $query->sortDirection)->orderBy('id', $query->sortDirection),
                    default => $builder->orderBy('name', $query->sortDirection)->orderBy('id', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return LengthAwarePaginator<int, AttendanceHoliday>
     */
    public function holidays(ListQueryOptions $query): LengthAwarePaginator
    {
        return AttendanceHoliday::query()
            ->when(
                filled($query->filter('type')),
                static fn (Builder $builder) => $builder->where('type', (string) $query->filter('type')),
            )
            ->when(
                filled($query->filter('start_date')),
                static fn (Builder $builder) => $builder->whereDate('holiday_date', '>=', (string) $query->filter('start_date')),
            )
            ->when(
                filled($query->filter('end_date')),
                static fn (Builder $builder) => $builder->whereDate('holiday_date', '<=', (string) $query->filter('end_date')),
            )
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('notes', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', static fn (Builder $builder) => $builder->orderBy('holiday_date')->orderBy('id'), function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'name' => $builder->orderBy('name', $query->sortDirection)->orderBy('id', $query->sortDirection),
                    'type' => $builder->orderBy('type', $query->sortDirection)->orderBy('id', $query->sortDirection),
                    default => $builder->orderBy('holiday_date', $query->sortDirection)->orderBy('id', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function clockIn(User $actor, array $data): AttendanceRecord
    {
        $employee = $this->linkedEmployee($actor);
        $now = Carbon::now();
        $attendanceDate = $now->copy()->startOfDay();
        $shift = $this->resolveAssignedShift($employee, $attendanceDate);

        if (! $shift) {
            throw ValidationException::withMessages([
                'shift' => 'No active shift assignment was found for today.',
            ]);
        }

        $this->validateShiftRequirements($shift, $data);

        $record = AttendanceRecord::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', $attendanceDate)
            ->first();

        if ($record?->clock_in_at) {
            throw ValidationException::withMessages([
                'clock_in' => 'You have already clocked in for today.',
            ]);
        }

        $holiday = $this->resolveHoliday($attendanceDate);
        $photoPath = $this->storePhoto($data['photo'] ?? null, 'attendance/clock-in');
        $metrics = $this->calculateMetrics(
            attendanceDate: $attendanceDate,
            shift: $shift,
            clockInAt: $now,
            clockOutAt: $record?->clock_out_at,
            isManual: false,
            isCorrected: (bool) ($record?->is_corrected ?? false),
        );
        $oldValues = $record?->toArray();

        return DB::transaction(function () use ($actor, $attendanceDate, $data, $employee, $holiday, $metrics, $now, $oldValues, $photoPath, $record, $shift): AttendanceRecord {
            $attendanceRecord = $record ?? new AttendanceRecord([
                'employee_id' => $employee->id,
                'attendance_date' => $attendanceDate->toDateString(),
                'created_by' => $actor->id,
            ]);

            $attendanceRecord->fill([
                'attendance_shift_id' => $shift->id,
                'attendance_holiday_id' => $holiday?->id,
                'status' => $metrics['status'],
                'clock_in_at' => $now,
                'clock_in_latitude' => $data['latitude'] ?? null,
                'clock_in_longitude' => $data['longitude'] ?? null,
                'clock_in_source' => filled($data['qr_token'] ?? null) ? 'qr' : 'self-service',
                'clock_in_photo_path' => $photoPath ?? $attendanceRecord->clock_in_photo_path,
                'is_late' => $metrics['is_late'],
                'late_minutes' => $metrics['late_minutes'],
                'is_overtime' => $metrics['is_overtime'],
                'overtime_minutes' => $metrics['overtime_minutes'],
                'worked_minutes' => $metrics['worked_minutes'],
                'is_weekend' => $metrics['is_weekend'],
                'is_holiday' => $metrics['is_holiday'],
                'notes' => $data['notes'] ?? $attendanceRecord->notes,
                'updated_by' => $actor->id,
                'meta' => array_filter([
                    'requires_qr' => $shift->requires_qr,
                    'requires_gps' => $shift->requires_gps,
                    'requires_photo' => $shift->requires_photo,
                ]),
            ]);
            $attendanceRecord->save();
            $attendanceRecord->load($this->recordRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $attendanceRecord,
                action: 'attendance.clocked-in',
                summary: "Clock in recorded for {$employee->full_name}.",
                oldValues: $oldValues,
                newValues: $attendanceRecord->toArray(),
            );

            return $attendanceRecord;
        });
    }

    public function clockOut(User $actor, array $data): AttendanceRecord
    {
        $employee = $this->linkedEmployee($actor);
        $record = AttendanceRecord::query()
            ->with(['employee', 'shift'])
            ->where('employee_id', $employee->id)
            ->whereNotNull('clock_in_at')
            ->whereNull('clock_out_at')
            ->orderByDesc('attendance_date')
            ->orderByDesc('clock_in_at')
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'clock_out' => 'No active clock in record was found.',
            ]);
        }

        $shift = $record->shift ?? $this->resolveAssignedShift($employee, Carbon::parse($record->attendance_date));

        if (! $shift) {
            throw ValidationException::withMessages([
                'shift' => 'The attendance record no longer has a valid shift.',
            ]);
        }

        $this->validateShiftRequirements($shift, $data);

        $now = Carbon::now();

        if ($record->clock_in_at && $now->lte($record->clock_in_at)) {
            throw ValidationException::withMessages([
                'clock_out' => 'Clock out time must be after clock in time.',
            ]);
        }

        $attendanceDate = Carbon::parse($record->attendance_date)->startOfDay();
        $holiday = $this->resolveHoliday($attendanceDate);
        $photoPath = $this->storePhoto($data['photo'] ?? null, 'attendance/clock-out');
        $metrics = $this->calculateMetrics(
            attendanceDate: $attendanceDate,
            shift: $shift,
            clockInAt: Carbon::parse($record->clock_in_at),
            clockOutAt: $now,
            isManual: $record->clock_in_source === 'manual' || $record->clock_out_source === 'manual',
            isCorrected: $record->is_corrected,
        );
        $oldValues = $record->toArray();

        return DB::transaction(function () use ($actor, $data, $employee, $holiday, $metrics, $now, $oldValues, $photoPath, $record, $shift): AttendanceRecord {
            $record->fill([
                'attendance_shift_id' => $shift->id,
                'attendance_holiday_id' => $holiday?->id,
                'status' => $metrics['status'],
                'clock_out_at' => $now,
                'clock_out_latitude' => $data['latitude'] ?? null,
                'clock_out_longitude' => $data['longitude'] ?? null,
                'clock_out_source' => filled($data['qr_token'] ?? null) ? 'qr' : 'self-service',
                'clock_out_photo_path' => $photoPath ?? $record->clock_out_photo_path,
                'is_late' => $metrics['is_late'],
                'late_minutes' => $metrics['late_minutes'],
                'is_overtime' => $metrics['is_overtime'],
                'overtime_minutes' => $metrics['overtime_minutes'],
                'worked_minutes' => $metrics['worked_minutes'],
                'is_weekend' => $metrics['is_weekend'],
                'is_holiday' => $metrics['is_holiday'],
                'notes' => $data['notes'] ?? $record->notes,
                'updated_by' => $actor->id,
            ]);
            $record->save();
            $record->load($this->recordRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $record,
                action: 'attendance.clocked-out',
                summary: "Clock out recorded for {$employee->full_name}.",
                oldValues: $oldValues,
                newValues: $record->toArray(),
            );

            return $record;
        });
    }

    public function manualRecord(User $actor, array $data): AttendanceRecord
    {
        /** @var Employee $employee */
        $employee = Employee::query()->with(['manager.user'])->findOrFail($data['employee_id']);
        $attendanceDate = Carbon::parse($data['attendance_date'])->startOfDay();
        $clockInAt = Carbon::parse($data['clock_in_at']);
        $clockOutAt = Carbon::parse($data['clock_out_at']);

        if ($clockOutAt->lte($clockInAt)) {
            throw ValidationException::withMessages([
                'clock_out_at' => 'Clock out time must be after clock in time.',
            ]);
        }

        $shift = isset($data['shift_id'])
            ? AttendanceShift::query()->find($data['shift_id'])
            : $this->resolveAssignedShift($employee, $attendanceDate);

        if (! $shift) {
            throw ValidationException::withMessages([
                'shift_id' => 'A valid shift is required to create manual attendance.',
            ]);
        }

        $holiday = $this->resolveHoliday($attendanceDate);
        $record = AttendanceRecord::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', $attendanceDate)
            ->first();
        $clockInPhotoPath = $this->storePhoto($data['clock_in_photo'] ?? null, 'attendance/manual');
        $clockOutPhotoPath = $this->storePhoto($data['clock_out_photo'] ?? null, 'attendance/manual');
        $metrics = $this->calculateMetrics(
            attendanceDate: $attendanceDate,
            shift: $shift,
            clockInAt: $clockInAt,
            clockOutAt: $clockOutAt,
            isManual: true,
            isCorrected: (bool) ($record?->is_corrected ?? false),
        );
        $oldValues = $record?->toArray();

        return DB::transaction(function () use ($actor, $attendanceDate, $clockInAt, $clockInPhotoPath, $clockOutAt, $clockOutPhotoPath, $data, $employee, $holiday, $metrics, $oldValues, $record, $shift): AttendanceRecord {
            $attendanceRecord = $record ?? new AttendanceRecord([
                'employee_id' => $employee->id,
                'attendance_date' => $attendanceDate->toDateString(),
                'created_by' => $actor->id,
            ]);

            $attendanceRecord->fill([
                'attendance_shift_id' => $shift->id,
                'attendance_holiday_id' => $holiday?->id,
                'status' => $metrics['status'],
                'clock_in_at' => $clockInAt,
                'clock_out_at' => $clockOutAt,
                'clock_in_source' => 'manual',
                'clock_out_source' => 'manual',
                'clock_in_photo_path' => $clockInPhotoPath ?? $attendanceRecord->clock_in_photo_path,
                'clock_out_photo_path' => $clockOutPhotoPath ?? $attendanceRecord->clock_out_photo_path,
                'is_late' => $metrics['is_late'],
                'late_minutes' => $metrics['late_minutes'],
                'is_overtime' => $metrics['is_overtime'],
                'overtime_minutes' => $metrics['overtime_minutes'],
                'worked_minutes' => $metrics['worked_minutes'],
                'is_weekend' => $metrics['is_weekend'],
                'is_holiday' => $metrics['is_holiday'],
                'notes' => $data['notes'] ?? null,
                'updated_by' => $actor->id,
                'meta' => [
                    'manual_entry' => true,
                ],
            ]);
            $attendanceRecord->save();
            $attendanceRecord->load($this->recordRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $attendanceRecord,
                action: 'attendance.manual.saved',
                summary: "Manual attendance saved for {$employee->full_name}.",
                oldValues: $oldValues,
                newValues: $attendanceRecord->toArray(),
            );

            return $attendanceRecord;
        });
    }

    public function createCorrection(User $actor, array $data): AttendanceCorrection
    {
        $record = $this->visibleRecordsQuery($actor)
            ->with(['employee.manager.user'])
            ->whereKey($data['attendance_record_id'])
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'attendance_record_id' => 'The selected attendance record is not visible to this account.',
            ]);
        }

        if (AttendanceCorrection::query()->where('attendance_record_id', $record->id)->where('status', 'pending')->exists()) {
            throw ValidationException::withMessages([
                'attendance_record_id' => 'There is already a pending correction for this attendance record.',
            ]);
        }

        $approver = $this->resolveCorrectionApprover($record->employee, $actor);

        if (! $approver) {
            throw ValidationException::withMessages([
                'approver' => 'No approver is available for this correction request.',
            ]);
        }

        $requestedClockInAt = Carbon::parse($data['requested_clock_in_at']);
        $requestedClockOutAt = filled($data['requested_clock_out_at'] ?? null)
            ? Carbon::parse($data['requested_clock_out_at'])
            : null;

        if ($requestedClockOutAt && $requestedClockOutAt->lte($requestedClockInAt)) {
            throw ValidationException::withMessages([
                'requested_clock_out_at' => 'Requested clock out time must be after requested clock in time.',
            ]);
        }

        return DB::transaction(function () use ($actor, $approver, $data, $record, $requestedClockInAt, $requestedClockOutAt): AttendanceCorrection {
            $correction = AttendanceCorrection::query()->create([
                'attendance_record_id' => $record->id,
                'employee_id' => $record->employee_id,
                'requested_by' => $actor->id,
                'approver_id' => $approver->id,
                'status' => 'pending',
                'requested_attendance_date' => $data['attendance_date'],
                'requested_clock_in_at' => $requestedClockInAt,
                'requested_clock_out_at' => $requestedClockOutAt,
                'reason' => $data['reason'],
                'remarks' => $data['notes'] ?? null,
                'snapshot_before' => $this->recordSnapshot($record),
            ]);

            $correction->load($this->correctionRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $correction,
                action: 'attendance.correction.requested',
                summary: "Attendance correction #{$correction->id} requested by {$actor->name}.",
                newValues: $correction->toArray(),
            );

            return $correction;
        });
    }

    public function approveCorrection(AttendanceCorrection $correction, User $actor, ?string $remarks = null): AttendanceCorrection
    {
        $correction->loadMissing(['attendanceRecord.employee', 'attendanceRecord.shift', 'employee']);

        if ($correction->status !== 'pending' || $correction->approver_id !== $actor->id) {
            throw ValidationException::withMessages([
                'approval' => 'No pending correction approval is assigned to this account.',
            ]);
        }

        $record = $correction->attendanceRecord;
        $attendanceDate = Carbon::parse($correction->requested_attendance_date)->startOfDay();
        $conflict = AttendanceRecord::query()
            ->where('employee_id', $record->employee_id)
            ->whereDate('attendance_date', $attendanceDate)
            ->whereKeyNot($record->id)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'attendance_date' => 'Another attendance record already exists for the requested date.',
            ]);
        }

        $shift = $record->shift ?? $this->resolveAssignedShift($record->employee, $attendanceDate);

        if (! $shift) {
            throw ValidationException::withMessages([
                'shift' => 'No shift could be resolved for the corrected attendance date.',
            ]);
        }

        $clockInAt = Carbon::parse($correction->requested_clock_in_at);
        $clockOutAt = $correction->requested_clock_out_at ? Carbon::parse($correction->requested_clock_out_at) : null;
        $holiday = $this->resolveHoliday($attendanceDate);
        $metrics = $this->calculateMetrics(
            attendanceDate: $attendanceDate,
            shift: $shift,
            clockInAt: $clockInAt,
            clockOutAt: $clockOutAt,
            isManual: false,
            isCorrected: true,
        );
        $recordBefore = $record->toArray();

        return DB::transaction(function () use ($actor, $attendanceDate, $clockInAt, $clockOutAt, $correction, $holiday, $metrics, $record, $recordBefore, $remarks, $shift): AttendanceCorrection {
            $record->fill([
                'attendance_date' => $attendanceDate->toDateString(),
                'attendance_shift_id' => $shift->id,
                'attendance_holiday_id' => $holiday?->id,
                'status' => $metrics['status'],
                'clock_in_at' => $clockInAt,
                'clock_out_at' => $clockOutAt,
                'clock_in_source' => 'correction',
                'clock_out_source' => $clockOutAt ? 'correction' : $record->clock_out_source,
                'is_late' => $metrics['is_late'],
                'late_minutes' => $metrics['late_minutes'],
                'is_overtime' => $metrics['is_overtime'],
                'overtime_minutes' => $metrics['overtime_minutes'],
                'worked_minutes' => $metrics['worked_minutes'],
                'is_weekend' => $metrics['is_weekend'],
                'is_holiday' => $metrics['is_holiday'],
                'is_corrected' => true,
                'updated_by' => $actor->id,
            ]);
            $record->save();

            $correction->fill([
                'status' => 'approved',
                'reviewed_by' => $actor->id,
                'remarks' => $remarks ?: $correction->remarks,
                'acted_at' => Carbon::now(),
                'snapshot_after' => $this->recordSnapshot($record->refresh()),
            ]);
            $correction->save();
            $correction->load($this->correctionRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $correction,
                action: 'attendance.correction.approved',
                summary: "Attendance correction #{$correction->id} approved by {$actor->name}.",
                oldValues: $recordBefore,
                newValues: $record->toArray(),
            );

            return $correction;
        });
    }

    public function rejectCorrection(AttendanceCorrection $correction, User $actor, string $remarks): AttendanceCorrection
    {
        if ($correction->status !== 'pending' || $correction->approver_id !== $actor->id) {
            throw ValidationException::withMessages([
                'approval' => 'No pending correction approval is assigned to this account.',
            ]);
        }

        return DB::transaction(function () use ($actor, $correction, $remarks): AttendanceCorrection {
            $correction->fill([
                'status' => 'rejected',
                'reviewed_by' => $actor->id,
                'remarks' => $remarks,
                'acted_at' => Carbon::now(),
            ]);
            $correction->save();
            $correction->load($this->correctionRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $correction,
                action: 'attendance.correction.rejected',
                summary: "Attendance correction #{$correction->id} rejected by {$actor->name}.",
                newValues: $correction->toArray(),
            );

            return $correction;
        });
    }

    public function saveShift(User $actor, array $data): AttendanceShift
    {
        return DB::transaction(function () use ($actor, $data): AttendanceShift {
            $shift = AttendanceShift::query()->updateOrCreate(
                ['code' => $data['code']],
                [
                    'name' => $data['name'],
                    'start_time' => $data['start_time'],
                    'end_time' => $data['end_time'],
                    'grace_minutes' => $data['grace_minutes'] ?? 0,
                    'requires_gps' => $data['requires_gps'] ?? false,
                    'requires_photo' => $data['requires_photo'] ?? false,
                    'requires_qr' => $data['requires_qr'] ?? false,
                    'latitude' => $data['latitude'] ?? null,
                    'longitude' => $data['longitude'] ?? null,
                    'radius_meters' => $data['radius_meters'] ?? null,
                    'qr_token' => $data['qr_token'] ?? null,
                    'is_active' => $data['is_active'] ?? true,
                    'meta' => $data['meta'] ?? null,
                ],
            );

            $shift->loadCount('assignments');

            $this->auditLogs->record(
                actor: $actor,
                auditable: $shift,
                action: 'attendance.shift.saved',
                summary: "Attendance shift {$shift->code} saved by {$actor->name}.",
                newValues: $shift->toArray(),
            );

            return $shift;
        });
    }

    public function assignShift(User $actor, array $data): AttendanceShiftAssignment
    {
        return DB::transaction(function () use ($actor, $data): AttendanceShiftAssignment {
            $assignment = AttendanceShiftAssignment::query()->updateOrCreate(
                [
                    'employee_id' => $data['employee_id'],
                    'start_date' => $data['start_date'],
                ],
                [
                    'attendance_shift_id' => $data['shift_id'],
                    'end_date' => $data['end_date'] ?? null,
                ],
            );

            $assignment->load(['employee.department', 'shift']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $assignment,
                action: 'attendance.shift.assigned',
                summary: "Shift assignment saved for employee #{$assignment->employee_id} by {$actor->name}.",
                newValues: $assignment->toArray(),
            );

            return $assignment;
        });
    }

    public function saveHoliday(User $actor, array $data): AttendanceHoliday
    {
        return DB::transaction(function () use ($actor, $data): AttendanceHoliday {
            $holiday = AttendanceHoliday::query()->updateOrCreate(
                ['holiday_date' => $data['holiday_date']],
                [
                    'name' => $data['name'],
                    'type' => $data['type'],
                    'notes' => $data['notes'] ?? null,
                ],
            );

            $this->auditLogs->record(
                actor: $actor,
                auditable: $holiday,
                action: 'attendance.holiday.saved',
                summary: "Attendance holiday {$holiday->name} saved by {$actor->name}.",
                newValues: $holiday->toArray(),
            );

            return $holiday;
        });
    }

    private function linkedEmployee(User $actor): Employee
    {
        /** @var Employee|null $employee */
        $employee = $actor->employee()->with(['manager.user', 'branch', 'department'])->first();

        if (! $employee) {
            throw ValidationException::withMessages([
                'employee' => 'Your account is not linked to an employee profile.',
            ]);
        }

        return $employee;
    }

    private function canSeeAllEmployees(User $actor): bool
    {
        return $actor->hasAnyRole(['super-admin', 'hr-manager', 'hr-staff', 'auditor', 'payroll-officer']);
    }

    /**
     * @return array<int, string>
     */
    private function recordRelations(): array
    {
        return [
            'employee.branch',
            'employee.department',
            'employee.manager.user',
            'shift',
            'holiday',
            'createdBy',
            'updatedBy',
        ];
    }

    /**
     * @return array<int, string>
     */
    private function correctionRelations(): array
    {
        return [
            'attendanceRecord.employee.branch',
            'attendanceRecord.employee.department',
            'attendanceRecord.shift',
            'attendanceRecord.holiday',
            'employee.branch',
            'employee.department',
            'requester',
            'approver',
            'reviewer',
        ];
    }

    private function visibleRecordsQuery(User $actor): Builder
    {
        return AttendanceRecord::query()
            ->when($this->canSeeAllEmployees($actor), static fn (Builder $query) => $query, function (Builder $query) use ($actor): void {
                if ($actor->hasRole('department-manager')) {
                    $query->where(function (Builder $innerQuery) use ($actor): void {
                        $innerQuery
                            ->whereHas('employee.user', static fn (Builder $employeeQuery) => $employeeQuery->where('id', $actor->id))
                            ->orWhereHas('employee.manager.user', static fn (Builder $managerQuery) => $managerQuery->where('id', $actor->id));
                    });

                    return;
                }

                $query->whereHas('employee.user', static fn (Builder $employeeQuery) => $employeeQuery->where('id', $actor->id));
            });
    }

    private function visibleCorrectionsQuery(User $actor): Builder
    {
        return AttendanceCorrection::query()
            ->when($this->canSeeAllEmployees($actor), static fn (Builder $query) => $query, function (Builder $query) use ($actor): void {
                if ($actor->hasRole('department-manager')) {
                    $query->where(function (Builder $innerQuery) use ($actor): void {
                        $innerQuery
                            ->whereHas('employee.user', static fn (Builder $employeeQuery) => $employeeQuery->where('id', $actor->id))
                            ->orWhereHas('employee.manager.user', static fn (Builder $managerQuery) => $managerQuery->where('id', $actor->id))
                            ->orWhere('approver_id', $actor->id);
                    });

                    return;
                }

                $query->whereHas('employee.user', static fn (Builder $employeeQuery) => $employeeQuery->where('id', $actor->id));
            });
    }

    private function approvalInboxQuery(User $actor): Builder
    {
        return AttendanceCorrection::query()
            ->where('approver_id', $actor->id)
            ->where('status', 'pending');
    }

    private function recordListingQuery(User $actor, ListQueryOptions $query): Builder
    {
        return $this->applyRecordSearch(
            $this->applyRecordFilters($this->visibleRecordsQuery($actor), $query->filters),
            $query->search,
        );
    }

    private function correctionListingQuery(Builder $query, ListQueryOptions $options): Builder
    {
        return $this->applyCorrectionSearch(
            $query
                ->when(
                    filled($options->filter('employee_id')),
                    static fn (Builder $builder) => $builder->where('employee_id', (int) $options->filter('employee_id')),
                )
                ->when(
                    filled($options->filter('status')),
                    static fn (Builder $builder) => $builder->where('status', (string) $options->filter('status')),
                ),
            $options->search,
        );
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function applyRecordFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when(
                filled($filters['employee_id'] ?? null),
                static fn (Builder $builder) => $builder->where('employee_id', (int) $filters['employee_id']),
            )
            ->when(
                filled($filters['shift_id'] ?? null),
                static fn (Builder $builder) => $builder->where('attendance_shift_id', (int) $filters['shift_id']),
            )
            ->when(
                filled($filters['status'] ?? null),
                static fn (Builder $builder) => $builder->where('status', (string) $filters['status']),
            )
            ->when(
                filled($filters['start_date'] ?? null),
                static fn (Builder $builder) => $builder->whereDate('attendance_date', '>=', (string) $filters['start_date']),
            )
            ->when(
                filled($filters['end_date'] ?? null),
                static fn (Builder $builder) => $builder->whereDate('attendance_date', '<=', (string) $filters['end_date']),
            )
            ->when(
                filter_var($filters['late_only'] ?? false, FILTER_VALIDATE_BOOLEAN),
                static fn (Builder $builder) => $builder->where('is_late', true),
            )
            ->when(
                filter_var($filters['holiday_only'] ?? false, FILTER_VALIDATE_BOOLEAN),
                static fn (Builder $builder) => $builder->where('is_holiday', true),
            )
            ->when(
                filter_var($filters['weekend_only'] ?? false, FILTER_VALIDATE_BOOLEAN),
                static fn (Builder $builder) => $builder->where('is_weekend', true),
            );
    }

    private function applyRecordSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, function (Builder $builder, string $search): void {
            $builder->where(function (Builder $innerQuery) use ($search): void {
                $innerQuery
                    ->where('status', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhere('attendance_date', 'like', "%{$search}%")
                    ->orWhereHas('employee', static fn (Builder $employeeQuery) => $employeeQuery
                        ->where('employee_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%"))
                    ->orWhereHas('shift', static fn (Builder $shiftQuery) => $shiftQuery
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%"));
            });
        });
    }

    private function applyRecordSorting(Builder $query, ListQueryOptions $options): Builder
    {
        return $query->when($options->sortBy === 'default', function (Builder $builder): void {
            $builder
                ->orderByDesc('attendance_date')
                ->orderByDesc('clock_in_at')
                ->orderByDesc('id');
        }, function (Builder $builder) use ($options): void {
            match ($options->sortBy) {
                'clock_in_at' => $builder->orderBy('clock_in_at', $options->sortDirection)->orderBy('id', $options->sortDirection),
                'late_minutes' => $builder->orderBy('late_minutes', $options->sortDirection)->orderBy('id', $options->sortDirection),
                'overtime_minutes' => $builder->orderBy('overtime_minutes', $options->sortDirection)->orderBy('id', $options->sortDirection),
                'status' => $builder->orderBy('status', $options->sortDirection)->orderBy('attendance_date', 'desc'),
                default => $builder->orderBy('attendance_date', $options->sortDirection)->orderBy('id', $options->sortDirection),
            };
        });
    }

    private function applyCorrectionSearch(Builder $query, ?string $search): Builder
    {
        return $query->when($search, function (Builder $builder, string $search): void {
            $builder->where(function (Builder $innerQuery) use ($search): void {
                $innerQuery
                    ->where('reason', 'like', "%{$search}%")
                    ->orWhere('remarks', 'like', "%{$search}%")
                    ->orWhere('requested_attendance_date', 'like', "%{$search}%")
                    ->orWhereHas('employee', static fn (Builder $employeeQuery) => $employeeQuery
                        ->where('employee_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%"));
            });
        });
    }

    private function applyCorrectionSorting(Builder $query, ListQueryOptions $options): Builder
    {
        return $query->when($options->sortBy === 'default', function (Builder $builder): void {
            $builder
                ->latest('created_at')
                ->latest('id');
        }, function (Builder $builder) use ($options): void {
            match ($options->sortBy) {
                'requested_attendance_date' => $builder->orderBy('requested_attendance_date', $options->sortDirection)->orderBy('id', $options->sortDirection),
                'status' => $builder->orderBy('status', $options->sortDirection)->orderByDesc('created_at'),
                'acted_at' => $builder->orderBy('acted_at', $options->sortDirection)->orderBy('id', $options->sortDirection),
                default => $builder->orderBy('created_at', $options->sortDirection)->orderBy('id', $options->sortDirection),
            };
        });
    }

    private function resolveAssignedShift(Employee $employee, CarbonInterface $date): ?AttendanceShift
    {
        /** @var AttendanceShiftAssignment|null $assignment */
        $assignment = AttendanceShiftAssignment::query()
            ->with('shift')
            ->where('employee_id', $employee->id)
            ->whereDate('start_date', '<=', $date)
            ->where(function (Builder $query) use ($date): void {
                $query
                    ->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', $date);
            })
            ->orderByDesc('start_date')
            ->first();

        return $assignment?->shift
            ?? AttendanceShift::query()->where('is_active', true)->orderBy('id')->first();
    }

    private function resolveHoliday(CarbonInterface $date): ?AttendanceHoliday
    {
        return AttendanceHoliday::query()->whereDate('holiday_date', $date)->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function validateShiftRequirements(AttendanceShift $shift, array $data): void
    {
        if ($shift->requires_qr && ($data['qr_token'] ?? null) !== $shift->qr_token) {
            throw ValidationException::withMessages([
                'qr_token' => 'The QR attendance token is invalid for this shift.',
            ]);
        }

        if ($shift->requires_photo && ! ($data['photo'] ?? null instanceof UploadedFile)) {
            throw ValidationException::withMessages([
                'photo' => 'A photo is required for this attendance shift.',
            ]);
        }

        if ($shift->requires_gps) {
            if (! isset($data['latitude'], $data['longitude'])) {
                throw ValidationException::withMessages([
                    'gps' => 'Latitude and longitude are required for this attendance shift.',
                ]);
            }

            if ($shift->latitude === null || $shift->longitude === null || $shift->radius_meters === null) {
                throw ValidationException::withMessages([
                    'shift' => 'This shift requires GPS validation but does not have a geofence configured.',
                ]);
            }

            $distance = $this->distanceInMeters(
                $shift->latitude,
                $shift->longitude,
                (float) $data['latitude'],
                (float) $data['longitude'],
            );

            if ($distance > $shift->radius_meters) {
                throw ValidationException::withMessages([
                    'gps' => "Attendance location is {$distance} meters away from the allowed radius.",
                ]);
            }
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function calculateMetrics(
        CarbonInterface $attendanceDate,
        AttendanceShift $shift,
        CarbonInterface $clockInAt,
        ?CarbonInterface $clockOutAt,
        bool $isManual = false,
        bool $isCorrected = false,
    ): array {
        $scheduledStart = $this->shiftDateTime($attendanceDate, (string) $shift->start_time);
        $scheduledEnd = $this->shiftDateTime($attendanceDate, (string) $shift->end_time);

        if ($scheduledEnd->lte($scheduledStart)) {
            $scheduledEnd = $scheduledEnd->addDay();
        }

        $graceThreshold = $scheduledStart->copy()->addMinutes($shift->grace_minutes);
        $lateMinutes = $clockInAt->greaterThan($graceThreshold)
            ? $graceThreshold->diffInMinutes($clockInAt)
            : 0;
        $workedMinutes = $clockOutAt ? $clockInAt->diffInMinutes($clockOutAt) : 0;
        $overtimeMinutes = $clockOutAt && $clockOutAt->greaterThan($scheduledEnd)
            ? $scheduledEnd->diffInMinutes($clockOutAt)
            : 0;
        $isLate = $lateMinutes > 0;
        $isOvertime = $overtimeMinutes > 0;

        return [
            'status' => $this->resolveStatus($isManual, $isCorrected, $clockOutAt !== null, $isLate),
            'is_late' => $isLate,
            'late_minutes' => $lateMinutes,
            'is_overtime' => $isOvertime,
            'overtime_minutes' => $overtimeMinutes,
            'worked_minutes' => $workedMinutes,
            'is_weekend' => $attendanceDate->isWeekend(),
            'is_holiday' => $this->resolveHoliday($attendanceDate) !== null,
        ];
    }

    private function resolveStatus(bool $isManual, bool $isCorrected, bool $hasClockOut, bool $isLate): string
    {
        if (! $hasClockOut) {
            return 'incomplete';
        }

        if ($isCorrected) {
            return 'corrected';
        }

        if ($isManual) {
            return 'manual';
        }

        return $isLate ? 'late' : 'present';
    }

    private function shiftDateTime(CarbonInterface $attendanceDate, string $time): Carbon
    {
        $normalizedTime = strlen($time) === 5 ? "{$time}:00" : $time;

        return Carbon::parse($attendanceDate->toDateString().' '.$normalizedTime);
    }

    private function distanceInMeters(float $latitudeA, float $longitudeA, float $latitudeB, float $longitudeB): int
    {
        $earthRadius = 6371000;
        $latitudeDelta = deg2rad($latitudeB - $latitudeA);
        $longitudeDelta = deg2rad($longitudeB - $longitudeA);
        $a = sin($latitudeDelta / 2) ** 2
            + cos(deg2rad($latitudeA)) * cos(deg2rad($latitudeB)) * sin($longitudeDelta / 2) ** 2;
        $distance = 2 * $earthRadius * asin(min(1, sqrt($a)));

        return (int) round($distance);
    }

    private function storePhoto(mixed $file, string $directory): ?string
    {
        if (! $file instanceof UploadedFile) {
            return null;
        }

        return $file->store($directory, 'public');
    }

    /**
     * @return array<string, mixed>|null
     */
    private function recordSnapshot(?AttendanceRecord $record): ?array
    {
        if (! $record) {
            return null;
        }

        return [
            'attendance_date' => $record->attendance_date?->toDateString(),
            'status' => $record->status,
            'clock_in_at' => $record->clock_in_at?->toDateTimeString(),
            'clock_out_at' => $record->clock_out_at?->toDateTimeString(),
            'late_minutes' => $record->late_minutes,
            'overtime_minutes' => $record->overtime_minutes,
            'worked_minutes' => $record->worked_minutes,
            'is_weekend' => $record->is_weekend,
            'is_holiday' => $record->is_holiday,
        ];
    }

    private function resolveCorrectionApprover(Employee $employee, User $actor): ?User
    {
        $managerApprover = $employee->manager?->user;

        if (
            $managerApprover
            && $managerApprover->id !== $actor->id
            && $managerApprover->hasPermissionTo('attendance.approve')
        ) {
            return $managerApprover;
        }

        return User::query()
            ->whereKeyNot($actor->id)
            ->whereHas('roles.permissions', static fn (Builder $query) => $query->where('code', 'attendance.approve'))
            ->orderBy('id')
            ->first();
    }
}
