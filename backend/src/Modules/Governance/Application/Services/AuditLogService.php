<?php

namespace Modules\Governance\Application\Services;

use App\Models\User;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Modules\Governance\Domain\Contracts\AuditLogRepository;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;

class AuditLogService
{
    public function __construct(
        private readonly AuditLogRepository $auditLogs,
    ) {
    }

    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function record(
        ?User $actor,
        Model $auditable,
        string $action,
        string $summary,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): AuditLog {
        $request = request();

        return $this->auditLogs->create([
            'actor_id' => $actor?->id,
            'auditable_type' => $auditable->getMorphClass(),
            'auditable_id' => $auditable->getKey(),
            'action' => $action,
            'summary' => $summary,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function paginate(int $perPage = 20, ?string $action = null): LengthAwarePaginator
    {
        return $this->auditLogs->paginate($perPage, $action);
    }
}
