<?php

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\AssignAttendanceShiftRequest;
use App\Http\Requests\Attendance\StoreAttendanceShiftRequest;
use App\Http\Resources\Attendance\AttendanceShiftResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Attendance\Application\Services\AttendanceService;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AttendanceShiftController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['is_active'],
            allowedSorts: ['default', 'name', 'start_time', 'end_time'],
        );
        $shifts = $this->attendanceService->shifts($query);

        return ApiResponse::paginated(
            $shifts,
            AttendanceShiftResource::collection($shifts->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(StoreAttendanceShiftRequest $request): JsonResponse
    {
        $shift = $this->attendanceService->saveShift(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new AttendanceShiftResource($shift),
            'Attendance shift saved successfully.',
            201,
        );
    }

    public function assign(AssignAttendanceShiftRequest $request): JsonResponse
    {
        $assignment = $this->attendanceService->assignShift(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success([
            'id' => $assignment->id,
            'employee' => [
                'id' => $assignment->employee?->id,
                'employee_number' => $assignment->employee?->employee_number,
                'full_name' => $assignment->employee?->full_name,
                'department' => $assignment->employee?->department?->name,
            ],
            'shift' => $assignment->shift ? (new AttendanceShiftResource($assignment->shift))->resolve() : null,
            'start_date' => $assignment->start_date?->toDateString(),
            'end_date' => $assignment->end_date?->toDateString(),
        ], 'Attendance shift assigned successfully.', 201);
    }
}
