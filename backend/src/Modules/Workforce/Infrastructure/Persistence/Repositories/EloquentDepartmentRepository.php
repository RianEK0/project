<?php

namespace Modules\Workforce\Infrastructure\Persistence\Repositories;

use Illuminate\Support\Collection;
use Modules\Workforce\Domain\Contracts\DepartmentRepository;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;

class EloquentDepartmentRepository implements DepartmentRepository
{
    public function all(): Collection
    {
        return Department::query()->orderBy('name')->get();
    }
}
