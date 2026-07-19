<?php

namespace Modules\Organization\Domain\Contracts;

use Illuminate\Support\Collection;
use Modules\Organization\Infrastructure\Persistence\Models\Team;

interface TeamRepository
{
    public function create(array $attributes): Team;

    /**
     * @return Collection<int, Team>
     */
    public function all(): Collection;

    /**
     * @return Collection<int, Team>
     */
    public function byDepartment(): Collection;
}
