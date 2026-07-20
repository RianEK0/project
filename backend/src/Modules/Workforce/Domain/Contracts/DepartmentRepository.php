<?php

namespace Modules\Workforce\Domain\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Shared\Application\Support\ListQueryOptions;

interface DepartmentRepository
{
    public function paginate(ListQueryOptions $query): LengthAwarePaginator;
}
