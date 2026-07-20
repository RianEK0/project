<?php

namespace Modules\Organization\Domain\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Shared\Application\Support\ListQueryOptions;

interface TeamRepository
{
    public function create(array $attributes): Team;

    /**
     * @return Collection<int, Team>
     */
    public function paginate(ListQueryOptions $query): LengthAwarePaginator;

    /**
     * @return Collection<int, Team>
     */
    public function byDepartment(): Collection;
}
