<?php

namespace Modules\Workforce\Infrastructure\Persistence\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Modules\Workforce\Domain\Contracts\EmployeeRepository;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\ListQueryOptions;

class EloquentEmployeeRepository implements EmployeeRepository
{
    public function paginate(ListQueryOptions $query): LengthAwarePaginator
    {
        return Employee::query()
            ->with(['branch.company', 'department', 'division', 'section', 'position', 'team', 'manager', 'user'])
            ->when($query->search, function ($builder, string $search): void {
                $builder->where(function ($innerQuery) use ($search): void {
                    $innerQuery
                        ->where('employee_number', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('middle_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('work_email', 'like', "%{$search}%")
                        ->orWhere('job_title', 'like', "%{$search}%")
                        ->orWhere('identity_card_number', 'like', "%{$search}%")
                        ->orWhere('npwp_number', 'like', "%{$search}%");
                });
            })
            ->when(filled($query->filter('department_id')), static fn ($builder) => $builder->where('department_id', (int) $query->filter('department_id')))
            ->when(filled($query->filter('branch_id')), static fn ($builder) => $builder->where('branch_id', (int) $query->filter('branch_id')))
            ->when(filled($query->filter('employment_status')), static fn ($builder) => $builder->where('employment_status', (string) $query->filter('employment_status')))
            ->when(filled($query->filter('employment_type')), static fn ($builder) => $builder->where('employment_type', (string) $query->filter('employment_type')))
            ->when(filled($query->filter('manager_id')), static fn ($builder) => $builder->where('manager_id', (int) $query->filter('manager_id')))
            ->when($query->sortBy === 'default', static fn ($builder) => $builder->latest(), function ($builder) use ($query): void {
                match ($query->sortBy) {
                    'employee_number' => $builder->orderBy('employee_number', $query->sortDirection),
                    'hire_date' => $builder->orderBy('hire_date', $query->sortDirection),
                    'employment_status' => $builder->orderBy('employment_status', $query->sortDirection),
                    'full_name' => $builder->orderBy('first_name', $query->sortDirection)->orderBy('last_name', $query->sortDirection),
                    default => $builder->orderBy('created_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
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
            ->with(['branch.company', 'department', 'division', 'section', 'position', 'team', 'manager'])
            ->latest('hire_date')
            ->limit($limit)
            ->get();
    }
}
