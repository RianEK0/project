<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leave\StoreLeaveRequestRequest;
use App\Http\Resources\Leave\LeaveRequestResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Leave\Application\DTO\LeaveRequestData;
use Modules\Leave\Application\Services\LeaveRequestService;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Shared\Application\Support\ApiResponse;

class LeaveRequestController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LeaveRequest::class);

        return ApiResponse::success(
            LeaveRequestResource::collection($this->leaveRequests->visibleRequests($request->user('api')))
        );
    }

    public function store(StoreLeaveRequestRequest $request): JsonResponse
    {
        $this->authorize('create', LeaveRequest::class);

        $leaveRequest = $this->leaveRequests->create(
            LeaveRequestData::fromArray($request->validated()),
            $request->user('api'),
        );

        return ApiResponse::success(
            new LeaveRequestResource($leaveRequest),
            'Leave request submitted successfully.',
            201,
        );
    }
}
