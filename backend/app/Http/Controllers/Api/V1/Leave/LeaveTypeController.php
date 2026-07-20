<?php

namespace App\Http\Controllers\Api\V1\Leave;

use App\Http\Controllers\Controller;
use App\Http\Resources\Leave\LeaveTypeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Leave\Application\Services\LeaveRequestService;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class LeaveTypeController extends Controller
{
    public function __construct(
        private readonly LeaveRequestService $leaveRequests,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['deducts_balance'],
            allowedSorts: ['default', 'name', 'code'],
            defaultSortBy: 'default',
        );
        $leaveTypes = $this->leaveRequests->leaveTypes($query);

        return ApiResponse::paginated(
            $leaveTypes,
            LeaveTypeResource::collection($leaveTypes->items())->resolve(),
            meta: $query->meta(),
        );
    }
}
