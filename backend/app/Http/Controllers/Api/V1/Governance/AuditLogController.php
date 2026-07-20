<?php

namespace App\Http\Controllers\Api\V1\Governance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Governance\AuditLogResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Governance\Application\Services\AuditLogService;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['action', 'actor_id', 'auditable_type'],
            allowedSorts: ['default', 'created_at', 'action', 'auditable_type'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $logs = $this->auditLogs->paginate($query);

        return ApiResponse::paginated(
            $logs,
            AuditLogResource::collection($logs->items())->resolve(),
            meta: $query->meta(),
        );
    }
}
