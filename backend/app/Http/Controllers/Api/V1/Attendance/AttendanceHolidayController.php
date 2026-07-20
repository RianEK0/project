<?php

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StoreAttendanceHolidayRequest;
use App\Http\Resources\Attendance\AttendanceHolidayResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Attendance\Application\Services\AttendanceService;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AttendanceHolidayController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['type', 'start_date', 'end_date'],
            allowedSorts: ['default', 'holiday_date', 'name', 'type'],
        );
        $holidays = $this->attendanceService->holidays($query);

        return ApiResponse::paginated(
            $holidays,
            AttendanceHolidayResource::collection($holidays->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(StoreAttendanceHolidayRequest $request): JsonResponse
    {
        $holiday = $this->attendanceService->saveHoliday(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new AttendanceHolidayResource($holiday),
            'Attendance holiday saved successfully.',
            201,
        );
    }
}
