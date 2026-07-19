<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Resources\Leave\LeaveApprovalResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Application\Support\ApiResponse;
use Modules\Leave\Application\Services\LeaveRequestService;

class ApprovalInboxController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        return ApiResponse::success(
            LeaveApprovalResource::collection($this->leaveRequests->approvalInbox($request->user('api')))
        );
    }
}
