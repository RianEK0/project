<?php

namespace Modules\Governance\Infrastructure\Persistence\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Governance\Domain\Contracts\AuditLogRepository;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;

class EloquentAuditLogRepository implements AuditLogRepository
{
    public function create(array $attributes): AuditLog
    {
        return AuditLog::query()->create($attributes);
    }

    public function paginate(int $perPage = 20, ?string $action = null): LengthAwarePaginator
    {
        return AuditLog::query()
            ->with('actor')
            ->when($action, static fn ($query, string $action) => $query->where('action', $action))
            ->latest('created_at')
            ->paginate($perPage);
    }
}
