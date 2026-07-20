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
use Shared\Application\Support\ListQueryOptions;

class LeaveRequestController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', LeaveRequest::class);

        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['employee_id', 'status', 'leave_type_id'],
            allowedSorts: ['default', 'submitted_at', 'start_date', 'end_date', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $leaveRequests = $this->leaveRequests->visibleRequests($request->user('api'), $query);

        return ApiResponse::paginated(
            $leaveRequests,
            LeaveRequestResource::collection($leaveRequests->items())->resolve(),
            meta: $query->meta(),
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
