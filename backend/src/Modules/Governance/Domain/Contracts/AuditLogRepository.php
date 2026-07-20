<?php

namespace Modules\Governance\Domain\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Shared\Application\Support\ListQueryOptions;

interface AuditLogRepository
{
    public function create(array $attributes): AuditLog;

    public function paginate(ListQueryOptions $query): LengthAwarePaginator;
}
