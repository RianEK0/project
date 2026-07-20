<?php

namespace App\Http\Controllers\Api\V1\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\ApproveAttendanceCorrectionRequest;
use App\Http\Requests\Attendance\RejectAttendanceCorrectionRequest;
use App\Http\Requests\Attendance\StoreAttendanceCorrectionRequest;
use App\Http\Resources\Attendance\AttendanceCorrectionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Attendance\Application\Services\AttendanceService;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceCorrection;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AttendanceCorrectionController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['employee_id', 'status'],
            allowedSorts: ['default', 'created_at', 'requested_attendance_date', 'status', 'acted_at'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $corrections = $this->attendanceService->corrections($request->user('api'), $query);

        return ApiResponse::paginated(
            $corrections,
            AttendanceCorrectionResource::collection($corrections->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(StoreAttendanceCorrectionRequest $request): JsonResponse
    {
        $correction = $this->attendanceService->createCorrection(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new AttendanceCorrectionResource($correction),
            'Attendance correction submitted successfully.',
            201,
        );
    }

    public function approvals(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['employee_id'],
            allowedSorts: ['default', 'created_at', 'requested_attendance_date'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $approvals = $this->attendanceService->approvalInbox($request->user('api'), $query);

        return ApiResponse::paginated(
            $approvals,
            AttendanceCorrectionResource::collection($approvals->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function approve(ApproveAttendanceCorrectionRequest $request, AttendanceCorrection $correction): JsonResponse
    {
        $correction = $this->attendanceService->approveCorrection(
            $correction,
            $request->user('api'),
            $request->validated('remarks'),
        );

        return ApiResponse::success(
            new AttendanceCorrectionResource($correction),
            'Attendance correction approved successfully.',
        );
    }

    public function reject(RejectAttendanceCorrectionRequest $request, AttendanceCorrection $correction): JsonResponse
    {
        $correction = $this->attendanceService->rejectCorrection(
            $correction,
            $request->user('api'),
            $request->validated('remarks'),
        );

        return ApiResponse::success(
            new AttendanceCorrectionResource($correction),
            'Attendance correction rejected successfully.',
        );
    }
}
