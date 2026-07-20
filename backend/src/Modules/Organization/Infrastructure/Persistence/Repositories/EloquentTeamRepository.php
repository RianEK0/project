<?php

namespace Modules\Organization\Infrastructure\Persistence\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Modules\Organization\Domain\Contracts\TeamRepository;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Shared\Application\Support\ListQueryOptions;

class EloquentTeamRepository implements TeamRepository
{
    public function create(array $attributes): Team
    {
        return Team::query()->create($attributes);
    }

    public function paginate(ListQueryOptions $query): LengthAwarePaginator
    {
        return Team::query()
            ->with(['department', 'lead', 'employees'])
            ->withCount('employees')
            ->when($query->search, function ($builder, string $search): void {
                $builder->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('department', static fn ($departmentQuery) => $departmentQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when(filled($query->filter('department_id')), static fn ($builder) => $builder->where('department_id', (int) $query->filter('department_id')))
            ->when(filled($query->filter('lead_employee_id')), static fn ($builder) => $builder->where('lead_employee_id', (int) $query->filter('lead_employee_id')))
            ->when($query->sortBy === 'default', static fn ($builder) => $builder->orderBy('name'), function ($builder) use ($query): void {
                match ($query->sortBy) {
                    'code' => $builder->orderBy('code', $query->sortDirection),
                    'employees_count' => $builder->orderBy('employees_count', $query->sortDirection),
                    default => $builder->orderBy('name', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
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
