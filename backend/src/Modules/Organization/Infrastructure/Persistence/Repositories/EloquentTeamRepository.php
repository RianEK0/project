<?php

namespace Modules\Organization\Infrastructure\Persistence\Repositories;

use Illuminate\Support\Collection;
use Modules\Organization\Domain\Contracts\TeamRepository;
use Modules\Organization\Infrastructure\Persistence\Models\Team;

class EloquentTeamRepository implements TeamRepository
{
    public function create(array $attributes): Team
    {
        return Team::query()->create($attributes);
    }

    public function all(): Collection
    {
        return Team::query()
            ->with(['department', 'lead', 'employees'])
            ->withCount('employees')
            ->orderBy('name')
            ->get();
    }

    public function byDepartment(): Collection
    {
        return Team::query()
            ->with(['department', 'lead'])
            ->withCount('employees')
            ->orderBy('department_id')
            ->orderBy('name')
            ->get()
            ->groupBy('department_id');
    }
}
