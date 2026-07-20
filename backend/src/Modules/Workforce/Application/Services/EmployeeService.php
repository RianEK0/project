<?php

namespace Modules\Workforce\Application\Services;

use App\Events\Workforce\EmployeeCreated;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Modules\Workforce\Application\DTO\EmployeeData;
use Modules\Workforce\Domain\Contracts\EmployeeRepository;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Division;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeDocument;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;
use Modules\Workforce\Infrastructure\Persistence\Models\Section;
use Shared\Application\Support\ListQueryOptions;

class EmployeeService
{
    public function __construct(
        private readonly EmployeeRepository $employees,
        private readonly AuditLogService $auditLogs,
    ) {
    }

    public function paginate(ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->employees->paginate($query);
    }

    public function create(EmployeeData $data, User $actor): Employee
    {
        return DB::transaction(function () use ($data, $actor): Employee {
            $employee = $this->employees->create($data->employeeAttributes());
            $this->syncSalaryHistories($employee, $data);
            $this->syncContracts($employee, $data);

            EmployeeCreated::dispatch($employee, $actor);
            $this->auditLogs->record(
                actor: $actor,
                auditable: $employee,
                action: 'employee.created',
                summary: "Employee {$employee->employee_number} created.",
                newValues: $this->show($employee->refresh())->toArray(),
            );

            return $this->show($employee);
        });
    }

    public function update(Employee $employee, EmployeeData $data, ?User $actor = null): Employee
    {
        return DB::transaction(function () use ($employee, $data, $actor): Employee {
            $before = $employee->toArray();
            $employee = $this->employees->update($employee, $data->employeeAttributes());
            $this->syncSalaryHistories($employee, $data);
            $this->syncContracts($employee, $data);

            if ($actor) {
                $this->auditLogs->record(
                    actor: $actor,
                    auditable: $employee,
                    action: 'employee.updated',
                    summary: "Employee {$employee->employee_number} updated.",
                    oldValues: $before,
                    newValues: $this->show($employee->refresh())->toArray(),
                );
            }

            return $this->show($employee);
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

    public function show(Employee $employee): Employee
    {
        return $employee->loadMissing($this->detailRelations());
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(): array
    {
        return [
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'code', 'description', 'cost_center']),
            'teams' => Team::query()
                ->with(['department:id,name,code'])
                ->orderBy('name')
                ->get(),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'code', 'address', 'phone', 'is_active']),
            'divisions' => Division::query()
                ->with('department:id,name,code')
                ->orderBy('name')
                ->get(),
            'sections' => Section::query()
                ->with('division:id,name,code,department_id')
                ->orderBy('name')
                ->get(),
            'positions' => Position::query()
                ->with(['division:id,name,code,department_id', 'section:id,name,code,division_id'])
                ->orderBy('name')
                ->get(),
            'managers' => Employee::query()
                ->orderBy('first_name')
                ->get(['id', 'employee_number', 'first_name', 'middle_name', 'last_name', 'job_title'])
                ->map(static fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'full_name' => $employee->full_name,
                    'job_title' => $employee->job_title,
                ]),
            'employment_types' => [
                ['value' => 'permanent', 'label' => 'Permanent'],
                ['value' => 'contract', 'label' => 'Contract'],
                ['value' => 'probation', 'label' => 'Probation'],
                ['value' => 'internship', 'label' => 'Internship'],
            ],
            'employment_statuses' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
                ['value' => 'probation', 'label' => 'Probation'],
                ['value' => 'resigned', 'label' => 'Resigned'],
            ],
        ];
    }

    public function uploadDocument(Employee $employee, UploadedFile $file, array $attributes, ?User $actor = null): Employee
    {
        return DB::transaction(function () use ($employee, $file, $attributes, $actor): Employee {
            $path = $file->store("employees/{$employee->id}/documents", 'public');

            $document = $employee->documents()->create([
                'uploaded_by' => $actor?->id,
                'category' => $attributes['category'],
                'label' => $attributes['label'],
                'disk' => 'public',
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'issued_at' => $attributes['issued_at'] ?? null,
                'expires_at' => $attributes['expires_at'] ?? null,
                'notes' => $attributes['notes'] ?? null,
            ]);

            if (($attributes['category'] ?? null) === 'photo') {
                $employee->forceFill(['photo_path' => $path])->save();
            }

            if ($actor) {
                $this->auditLogs->record(
                    actor: $actor,
                    auditable: $employee,
                    action: 'employee.document_uploaded',
                    summary: "Document {$document->label} uploaded for {$employee->employee_number}.",
                    newValues: [
                        'document_id' => $document->id,
                        'category' => $document->category,
                        'label' => $document->label,
                        'file_name' => $document->file_name,
                    ],
                );
            }

            return $this->show($employee->refresh());
        });
    }

    public function deleteDocument(Employee $employee, EmployeeDocument $document, ?User $actor = null): Employee
    {
        return DB::transaction(function () use ($employee, $document, $actor): Employee {
            $before = $document->toArray();

            Storage::disk($document->disk)->delete($document->file_path);

            if ($employee->photo_path === $document->file_path) {
                $employee->forceFill(['photo_path' => null])->save();
            }

            $document->delete();

            if ($actor) {
                $this->auditLogs->record(
                    actor: $actor,
                    auditable: $employee,
                    action: 'employee.document_deleted',
                    summary: "Document {$before['label']} removed from {$employee->employee_number}.",
                    oldValues: $before,
                );
            }

            return $this->show($employee->refresh());
        });
    }

    public function auditLogs(Employee $employee, int $perPage = 20): LengthAwarePaginator
    {
        return AuditLog::query()
            ->with('actor')
            ->where('auditable_type', $employee->getMorphClass())
            ->where('auditable_id', $employee->getKey())
            ->latest('created_at')
            ->paginate($perPage);
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

    /**
     * @return list<string>
     */
    private function detailRelations(): array
    {
        return [
            'branch',
            'department',
            'division',
            'section',
            'position',
            'team',
            'manager',
            'user',
            'salaryHistories',
            'contracts',
            'documents.uploadedBy',
        ];
    }

    private function syncSalaryHistories(Employee $employee, EmployeeData $data): void
    {
        if (! $data->hasField('salary_histories')) {
            return;
        }

        $items = $data->salary_histories ?? [];
        $this->syncChildRecords(
            $employee,
            'salaryHistories',
            $items,
            ['component', 'amount', 'currency', 'pay_frequency', 'effective_date', 'end_date', 'is_current', 'notes', 'meta'],
        );
    }

    private function syncContracts(Employee $employee, EmployeeData $data): void
    {
        if (! $data->hasField('contracts')) {
            return;
        }

        $items = $data->contracts ?? [];
        $this->syncChildRecords(
            $employee,
            'contracts',
            $items,
            ['contract_type', 'contract_number', 'start_date', 'end_date', 'status', 'terms', 'notes', 'meta'],
        );
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  list<string>  $fillable
     */
    private function syncChildRecords(Employee $employee, string $relation, array $items, array $fillable): void
    {
        $query = $employee->{$relation}();
        $incomingIds = collect($items)
            ->pluck('id')
            ->filter()
            ->map(static fn ($id): int => (int) $id)
            ->values()
            ->all();

        if ($incomingIds === []) {
            $query->delete();
        } else {
            $query->whereNotIn('id', $incomingIds)->delete();
        }

        foreach ($items as $item) {
            $attributes = array_intersect_key($item, array_flip($fillable));

            if (isset($item['id'])) {
                $query->whereKey((int) $item['id'])->update($attributes);

                continue;
            }

            $query->create($attributes);
        }
    }
}
