<?php

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\ClockInRequest;
use App\Http\Requests\Attendance\ClockOutRequest;
use App\Http\Requests\Attendance\StoreManualAttendanceRequest;
use App\Http\Resources\Attendance\AttendanceHolidayResource;
use App\Http\Resources\Attendance\AttendanceRecordResource;
use App\Http\Resources\Attendance\AttendanceShiftResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Attendance\Application\Services\AttendanceService;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->attendanceService->overview($request->user('api'));

        return ApiResponse::success([
            'today' => [
                'date' => $overview['today']['date'],
                'employee' => $overview['today']['employee'] ? [
                    'id' => $overview['today']['employee']->id,
                    'employee_number' => $overview['today']['employee']->employee_number,
                    'full_name' => $overview['today']['employee']->full_name,
                    'branch' => $overview['today']['employee']->branch?->name,
                    'department' => $overview['today']['employee']->department?->name,
                ] : null,
                'shift' => $overview['today']['shift'] ? (new AttendanceShiftResource($overview['today']['shift']))->resolve() : null,
                'record' => $overview['today']['record'] ? (new AttendanceRecordResource($overview['today']['record']))->resolve() : null,
                'holiday' => $overview['today']['holiday'] ? (new AttendanceHolidayResource($overview['today']['holiday']))->resolve() : null,
            ],
            'stats' => $overview['stats'],
        ]);
    }

    public function lookups(Request $request): JsonResponse
    {
        $lookups = $this->attendanceService->lookups($request->user('api'));

        return ApiResponse::success([
            'employees' => collect($lookups['employees'])->map(static fn ($employee): array => [
                'id' => $employee->id,
                'employee_number' => $employee->employee_number,
                'full_name' => $employee->full_name,
                'branch' => $employee->branch?->name,
                'department' => $employee->department?->name,
            ])->values()->all(),
            'shifts' => AttendanceShiftResource::collection($lookups['shifts'])->resolve(),
            'holidays' => AttendanceHolidayResource::collection($lookups['holidays'])->resolve(),
            'today' => [
                'date' => $lookups['today']['date'],
                'shift' => $lookups['today']['shift'] ? (new AttendanceShiftResource($lookups['today']['shift']))->resolve() : null,
                'record' => $lookups['today']['record'] ? (new AttendanceRecordResource($lookups['today']['record']))->resolve() : null,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['employee_id', 'shift_id', 'status', 'start_date', 'end_date', 'late_only', 'holiday_only', 'weekend_only'],
            allowedSorts: ['default', 'attendance_date', 'clock_in_at', 'late_minutes', 'overtime_minutes', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $records = $this->attendanceService->records($request->user('api'), $query);

        return ApiResponse::paginated(
            $records,
            AttendanceRecordResource::collection($records->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $record = $this->attendanceService->clockIn(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new AttendanceRecordResource($record),
            'Clock in recorded successfully.',
            201,
        );
    }

    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        $record = $this->attendanceService->clockOut(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new AttendanceRecordResource($record),
            'Clock out recorded successfully.',
        );
    }

    public function manual(StoreManualAttendanceRequest $request): JsonResponse
    {
        $record = $this->attendanceService->manualRecord(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new AttendanceRecordResource($record),
            'Manual attendance saved successfully.',
            201,
        );
    }

    public function report(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['employee_id', 'shift_id', 'status', 'start_date', 'end_date', 'late_only', 'holiday_only', 'weekend_only'],
            allowedSorts: ['default', 'attendance_date', 'clock_in_at', 'late_minutes', 'overtime_minutes', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $report = $this->attendanceService->report($request->user('api'), $query);

        return ApiResponse::success(
            [
                'summary' => $report['summary'],
                'records' => AttendanceRecordResource::collection($report['records']->items())->resolve(),
            ],
            meta: ApiResponse::paginationMeta($report['records'], $query->meta()),
        );
    }
}
