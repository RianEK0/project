<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Resources\Leave\LeaveTypeResource;
use Illuminate\Http\JsonResponse;
use Modules\Leave\Application\Services\LeaveRequestService;
use Shared\Application\Support\ApiResponse;

class LeaveTypeController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function index(): JsonResponse
    {
        return ApiResponse::success(
            LeaveTypeResource::collection($this->leaveRequests->leaveTypes())
        );
    }
}
