<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\ApproveLeaveRequest;
use App\Http\Requests\Leave\RejectLeaveRequest;
use App\Http\Resources\Leave\LeaveRequestResource;
use Illuminate\Http\JsonResponse;
use Modules\Leave\Application\Services\LeaveRequestService;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Shared\Application\Support\ApiResponse;

class LeaveApprovalController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function approve(ApproveLeaveRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $this->authorize('approve', $leaveRequest);

        $leaveRequest = $this->leaveRequests->approve(
            $leaveRequest,
            $request->user('api'),
            $request->validated('remarks'),
        );

        return ApiResponse::success(
            new LeaveRequestResource($leaveRequest),
            'Leave request approved successfully.',
        );
    }

    public function reject(RejectLeaveRequest $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $this->authorize('reject', $leaveRequest);

        $leaveRequest = $this->leaveRequests->reject(
            $leaveRequest,
            $request->user('api'),
            $request->validated('remarks'),
        );

        return ApiResponse::success(
            new LeaveRequestResource($leaveRequest),
            'Leave request rejected successfully.',
        );
    }
}
