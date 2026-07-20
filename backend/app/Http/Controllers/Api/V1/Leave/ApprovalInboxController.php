<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Resources\Leave\LeaveApprovalResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Application\Support\ApiResponse;
use Modules\Leave\Application\Services\LeaveRequestService;
use Shared\Application\Support\ListQueryOptions;

class ApprovalInboxController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['status'],
            allowedSorts: ['default', 'created_at', 'stage', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $approvals = $this->leaveRequests->approvalInbox($request->user('api'), $query);

        return ApiResponse::paginated(
            $approvals,
            LeaveApprovalResource::collection($approvals->items())->resolve(),
            meta: $query->meta(),
        );
    }
}
