<?php

namespace Modules\Workforce\Application\Services;

use App\Events\Workforce\EmployeeCreated;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Workforce\Application\DTO\EmployeeData;
use Modules\Workforce\Domain\Contracts\EmployeeRepository;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepository $employees,
        private readonly AuditLogService $auditLogs,
    ) {
    }

    public function paginate(int $perPage = 15, ?string $search = null): LengthAwarePaginator
    {
        return $this->employees->paginate($perPage, $search);
    }

    public function create(EmployeeData $data, User $actor): Employee
    {
        return DB::transaction(function () use ($data, $actor): Employee {
            $employee = $this->employees->create($data->toArray());

            EmployeeCreated::dispatch($employee, $actor);
            $this->auditLogs->record(
                actor: $actor,
                auditable: $employee,
                action: 'employee.created',
                summary: "Employee {$employee->employee_number} created.",
                newValues: $employee->fresh()->toArray(),
            );

            return $employee->loadMissing('department', 'team', 'manager', 'user');
        });
    }

    public function update(Employee $employee, EmployeeData $data, ?User $actor = null): Employee
    {
        return DB::transaction(function () use ($employee, $data, $actor): Employee {
            $before = $employee->toArray();
            $employee = $this->employees->update($employee, $data->toArray());

            if ($actor) {
                $this->auditLogs->record(
                    actor: $actor,
                    auditable: $employee,
                    action: 'employee.updated',
                    summary: "Employee {$employee->employee_number} updated.",
                    oldValues: $before,
                    newValues: $employee->fresh()->toArray(),
                );
            }

            return $employee->loadMissing('department', 'team', 'manager', 'user');
        });
    }

    public function delete(Employee $employee, ?User $actor = null): void
    {
        $before = $employee->toArray();
        $this->employees->delete($employee);

        if ($actor) {
            $this->auditLogs->record(
                actor: $actor,
                auditable: $employee,
                action: 'employee.archived',
                summary: "Employee {$employee->employee_number} archived.",
                oldValues: $before,
            );
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function dashboardSummary(): array
    {
        return [
            'metrics' => $this->employees->metrics(),
            'recent_hires' => $this->employees->recent(),
        ];
    }
}
