<?php

namespace App\Http\Controllers\Api\V1\Governance;

use App\Http\Controllers\Controller;
use App\Http\Resources\Governance\AuditLogResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Governance\Application\Services\AuditLogService;
use Shared\Application\Support\ApiResponse;

class AuditLogController extends Controller
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $logs = $this->auditLogs->paginate(
            perPage: (int) $request->integer('per_page', 20),
            action: $request->string('action')->toString() ?: null,
        );

        return ApiResponse::success(
            AuditLogResource::collection($logs->items()),
            meta: [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        );
    }
}
