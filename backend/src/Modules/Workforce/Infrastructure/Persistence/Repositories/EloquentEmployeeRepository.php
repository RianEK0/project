<?php

namespace Modules\Workforce\Infrastructure\Persistence\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Modules\Workforce\Domain\Contracts\EmployeeRepository;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class EloquentEmployeeRepository implements EmployeeRepository
{
    public function paginate(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        return Employee::query()
            ->with(['department', 'team', 'manager', 'user'])
            ->when($search, function ($query, string $search): void {
                $query->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('employee_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('work_email', 'like', "%{$search}%")
                        ->orWhere('job_title', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $attributes): Employee
    {
        return Employee::query()->create($attributes);
    }

    public function update(Employee $employee, array $attributes): Employee
    {
        $employee->fill($attributes)->save();

        return $employee->refresh();
    }

    public function delete(Employee $employee): void
    {
        $employee->delete();
    }

    public function metrics(): array
    {
        return [
            'total_employees' => Employee::query()->count(),
            'active_employees' => Employee::query()->where('employment_status', 'active')->count(),
            'total_departments' => Department::query()->count(),
            'new_hires_this_month' => Employee::query()
                ->whereBetween('hire_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
        ];
    }

    public function recent(int $limit = 5): Collection
    {
        return Employee::query()
            ->with(['department', 'team', 'manager'])
            ->latest('hire_date')
            ->limit($limit)
            ->get();
    }
}
