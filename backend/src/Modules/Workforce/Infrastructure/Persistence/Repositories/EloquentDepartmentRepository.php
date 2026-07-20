<?php

namespace Modules\Workforce\Infrastructure\Persistence\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Workforce\Domain\Contracts\DepartmentRepository;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Shared\Application\Support\ListQueryOptions;

class EloquentDepartmentRepository implements DepartmentRepository
{
    public function paginate(ListQueryOptions $query): LengthAwarePaginator
    {
        return Department::query()
            ->when($query->search, function ($builder, string $search): void {
                $builder->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('cost_center', 'like', "%{$search}%");
                });
            })
            ->when(
                $query->sortBy === 'default',
                static fn ($builder) => $builder->orderBy('name'),
                static fn ($builder) => $builder->orderBy($query->sortBy === 'code' ? 'code' : 'name', $query->sortDirection),
            )
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }
}
