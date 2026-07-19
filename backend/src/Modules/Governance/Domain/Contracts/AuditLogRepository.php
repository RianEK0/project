<?php

namespace Modules\Governance\Domain\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;

interface AuditLogRepository
{
    public function create(array $attributes): AuditLog;

    public function paginate(int $perPage = 20, ?string $action = null): LengthAwarePaginator;
}
