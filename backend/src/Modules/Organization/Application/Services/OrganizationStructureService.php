<?php

namespace Modules\Organization\Application\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Company;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Division;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;
use Modules\Workforce\Infrastructure\Persistence\Models\Section;

class OrganizationStructureService
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(): array
    {
        $companies = Company::query()
            ->with(['branches.head'])
            ->orderBy('name')
            ->get();

        $departments = Department::query()->with('head')->orderBy('name')->get()->keyBy('id');
        $divisions = Division::query()->with('head')->orderBy('name')->get();
        $sections = Section::query()->with('head')->orderBy('name')->get();
        $positions = Position::query()
            ->with(['division:id,name,code,department_id', 'section:id,name,code,division_id'])
            ->orderBy('name')
            ->get();

        $divisionsByDepartment = $divisions->groupBy('department_id');
        $sectionsByDivision = $sections->groupBy('division_id');
        $positionsBySection = $positions
            ->filter(static fn (Position $position): bool => $position->section_id !== null)
            ->groupBy('section_id');
        $positionsByDivision = $positions->groupBy('division_id');

        $employees = Employee::query()
            ->with([
                'branch.company',
                'department',
                'division',
                'section',
                'position',
                'manager:id,employee_number,first_name,middle_name,last_name,job_title,work_email',
            ])
            ->orderBy('first_name')
            ->get();

        $teams = Team::query()
            ->with(['department', 'lead'])
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        $reportCounts = $employees->countBy('manager_id');

        $companyHierarchy = $companies->map(function (Company $company) use (
            $employees,
            $departments,
            $divisionsByDepartment,
            $sectionsByDivision,
            $positionsBySection,
            $positionsByDivision,
        ): array {
            $companyEmployees = $employees->filter(
                static fn (Employee $employee): bool => $employee->branch?->company_id === $company->id,
            );

            return [
                'id' => $company->id,
                'name' => $company->name,
                'code' => $company->code,
                'legal_name' => $company->legal_name,
                'email' => $company->email,
                'phone' => $company->phone,
                'website' => $company->website,
                'address' => $company->address,
                'description' => $company->description,
                'headcount' => $companyEmployees->count(),
                'branches' => $company->branches->map(function (Branch $branch) use (
                    $companyEmployees,
                    $departments,
                    $divisionsByDepartment,
                    $sectionsByDivision,
                    $positionsBySection,
                    $positionsByDivision,
                ): array {
                    $branchEmployees = $companyEmployees->where('branch_id', $branch->id)->values();
                    $departmentIds = $branchEmployees->pluck('department_id')->filter()->unique()->values();

                    return [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'code' => $branch->code,
                        'address' => $branch->address,
                        'phone' => $branch->phone,
                        'is_active' => $branch->is_active,
                        'headcount' => $branchEmployees->count(),
                        'manager' => $this->employeeReference($branch->head),
                        'departments' => $departmentIds->map(function (int $departmentId) use (
                            $branchEmployees,
                            $departments,
                            $divisionsByDepartment,
                            $sectionsByDivision,
                            $positionsBySection,
                            $positionsByDivision,
                        ): array {
                            /** @var Department|null $department */
                            $department = $departments->get($departmentId);
                            $departmentEmployees = $branchEmployees->where('department_id', $departmentId)->values();
                            $divisionIds = $departmentEmployees->pluck('division_id')->filter()->unique()->values();

                            return [
                                'id' => $department?->id,
                                'name' => $department?->name,
                                'code' => $department?->code,
                                'cost_center' => $department?->cost_center,
                                'description' => $department?->description,
                                'headcount' => $departmentEmployees->count(),
                                'manager' => $this->employeeReference($department?->head),
                                'divisions' => $divisionIds->map(function (int $divisionId) use (
                                    $department,
                                    $departmentEmployees,
                                    $divisionsByDepartment,
                                    $sectionsByDivision,
                                    $positionsBySection,
                                    $positionsByDivision,
                                ): array {
                                    /** @var Division|null $division */
                                    $division = $divisionsByDepartment
                                        ->get($department?->id, collect())
                                        ->firstWhere('id', $divisionId);

                                    $divisionEmployees = $departmentEmployees->where('division_id', $divisionId)->values();
                                    $sectionIds = $divisionEmployees->pluck('section_id')->filter()->unique()->values();
                                    $divisionPositions = $positionsByDivision->get($divisionId, collect());
                                    $sectionPositionIds = $sectionIds
                                        ->flatMap(static fn (int $sectionId) => $positionsBySection->get($sectionId, collect())->pluck('id'))
                                        ->unique()
                                        ->values();
                                    $unassignedDivisionPositions = $divisionPositions
                                        ->reject(static fn (Position $position): bool => $sectionPositionIds->contains($position->id));

                                    return [
                                        'id' => $division?->id,
                                        'name' => $division?->name,
                                        'code' => $division?->code,
                                        'description' => $division?->description,
                                        'headcount' => $divisionEmployees->count(),
                                        'manager' => $this->employeeReference($division?->head),
                                        'sections' => $sectionIds->map(function (int $sectionId) use (
                                            $division,
                                            $divisionEmployees,
                                            $sectionsByDivision,
                                            $positionsBySection,
                                        ): array {
                                            /** @var Section|null $section */
                                            $section = $sectionsByDivision
                                                ->get($division?->id, collect())
                                                ->firstWhere('id', $sectionId);

                                            $sectionEmployees = $divisionEmployees->where('section_id', $sectionId)->values();
                                            $positionIds = $sectionEmployees->pluck('position_id')->filter()->unique()->values();

                                            return [
                                                'id' => $section?->id,
                                                'name' => $section?->name,
                                                'code' => $section?->code,
                                                'description' => $section?->description,
                                                'headcount' => $sectionEmployees->count(),
                                                'manager' => $this->employeeReference($section?->head),
                                                'positions' => $positionsBySection
                                                    ->get($sectionId, collect())
                                                    ->whereIn('id', $positionIds)
                                                    ->map(fn (Position $position): array => $this->serializePosition(
                                                        $position,
                                                        $sectionEmployees->where('position_id', $position->id)->values(),
                                                    ))
                                                    ->values()
                                                    ->all(),
                                            ];
                                        })->values()->all(),
                                        'positions' => $unassignedDivisionPositions
                                            ->map(fn (Position $position): array => $this->serializePosition(
                                                $position,
                                                $divisionEmployees->where('position_id', $position->id)->values(),
                                            ))
                                            ->values()
                                            ->all(),
                                    ];
                                })->values()->all(),
                            ];
                        })->values()->all(),
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        $reportingLines = $employees->map(function (Employee $employee) use ($reportCounts): array {
            return [
                'employee' => $this->employeeReference($employee),
                'manager' => $this->employeeReference($employee->manager),
                'branch' => $employee->branch ? [
                    'id' => $employee->branch->id,
                    'name' => $employee->branch->name,
                    'code' => $employee->branch->code,
                ] : null,
                'department' => $employee->department ? [
                    'id' => $employee->department->id,
                    'name' => $employee->department->name,
                    'code' => $employee->department->code,
                ] : null,
                'division' => $employee->division ? [
                    'id' => $employee->division->id,
                    'name' => $employee->division->name,
                    'code' => $employee->division->code,
                ] : null,
                'section' => $employee->section ? [
                    'id' => $employee->section->id,
                    'name' => $employee->section->name,
                    'code' => $employee->section->code,
                ] : null,
                'position' => $employee->position ? [
                    'id' => $employee->position->id,
                    'name' => $employee->position->name,
                    'code' => $employee->position->code,
                    'grade' => $employee->position->grade,
                ] : null,
                'direct_reports_count' => (int) ($reportCounts->get($employee->id) ?? 0),
            ];
        })->values()->all();

        $childrenByManager = $employees->groupBy('manager_id');
        $validEmployeeIds = $employees->pluck('id')->all();

        $rootEmployees = $employees
            ->filter(static fn (Employee $employee): bool => $employee->manager_id === null || ! in_array($employee->manager_id, $validEmployeeIds, true))
            ->values();

        return [
            'summary' => [
                'companies' => $companies->count(),
                'branches' => Branch::query()->count(),
                'departments' => Department::query()->count(),
                'divisions' => Division::query()->count(),
                'sections' => Section::query()->count(),
                'positions' => Position::query()->count(),
                'employees' => $employees->count(),
                'active_reporting_lines' => $employees->whereNotNull('manager_id')->count(),
            ],
            'companies' => $companyHierarchy,
            'reporting_lines' => $reportingLines,
            'organization_chart' => $rootEmployees
                ->map(fn (Employee $employee): array => $this->buildChartNode($employee, $childrenByManager, $reportCounts))
                ->values()
                ->all(),
            'operational_teams' => $teams->map(fn (Team $team): array => [
                'id' => $team->id,
                'name' => $team->name,
                'code' => $team->code,
                'employees_count' => $team->employees_count,
                'department' => $team->department ? [
                    'id' => $team->department->id,
                    'name' => $team->department->name,
                    'code' => $team->department->code,
                ] : null,
                'lead' => $this->employeeReference($team->lead),
            ])->values()->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(): array
    {
        return [
            'companies' => Company::query()->orderBy('name')->get(['id', 'name', 'code', 'legal_name']),
            'branches' => Branch::query()->with(['company:id,name,code'])->orderBy('name')->get(),
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'code', 'cost_center']),
            'divisions' => Division::query()->with(['department:id,name,code'])->orderBy('name')->get(),
            'sections' => Section::query()->with(['division:id,name,code,department_id'])->orderBy('name')->get(),
            'positions' => Position::query()->with(['division:id,name,code,department_id', 'section:id,name,code,division_id'])->orderBy('name')->get(),
            'employees' => Employee::query()
                ->orderBy('first_name')
                ->get(['id', 'employee_number', 'first_name', 'middle_name', 'last_name', 'job_title'])
                ->map(fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'full_name' => $employee->full_name,
                    'job_title' => $employee->job_title,
                ]),
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createUnit(array $payload, User $actor): array
    {
        $type = $payload['type'];

        $unit = match ($type) {
            'company' => Company::query()->create([
                'name' => $payload['name'],
                'code' => $payload['code'],
                'legal_name' => $payload['legal_name'] ?? null,
                'email' => $payload['email'] ?? null,
                'phone' => $payload['phone'] ?? null,
                'website' => $payload['website'] ?? null,
                'address' => $payload['address'] ?? null,
                'description' => $payload['description'] ?? null,
            ]),
            'branch' => Branch::query()->create([
                'company_id' => $payload['company_id'],
                'name' => $payload['name'],
                'code' => $payload['code'],
                'address' => $payload['address'] ?? null,
                'phone' => $payload['phone'] ?? null,
                'head_employee_id' => $payload['head_employee_id'] ?? null,
                'is_active' => $payload['is_active'] ?? true,
            ]),
            'department' => Department::query()->create([
                'name' => $payload['name'],
                'code' => $payload['code'],
                'description' => $payload['description'] ?? null,
                'cost_center' => $payload['cost_center'] ?? null,
                'head_employee_id' => $payload['head_employee_id'] ?? null,
            ]),
            'division' => Division::query()->create([
                'department_id' => $payload['department_id'],
                'name' => $payload['name'],
                'code' => $payload['code'],
                'description' => $payload['description'] ?? null,
                'head_employee_id' => $payload['head_employee_id'] ?? null,
            ]),
            'section' => Section::query()->create([
                'division_id' => $payload['division_id'],
                'name' => $payload['name'],
                'code' => $payload['code'],
                'description' => $payload['description'] ?? null,
                'head_employee_id' => $payload['head_employee_id'] ?? null,
            ]),
            'position' => Position::query()->create([
                'division_id' => $payload['division_id'],
                'section_id' => $payload['section_id'] ?? null,
                'name' => $payload['name'],
                'code' => $payload['code'],
                'grade' => $payload['grade'] ?? null,
                'description' => $payload['description'] ?? null,
            ]),
        };

        $reference = $unit->code ?? $unit->name;

        $this->auditLogs->record(
            actor: $actor,
            auditable: $unit,
            action: "organization.{$type}.created",
            summary: ucfirst($type)." {$reference} created.",
            newValues: $unit->fresh()->toArray(),
        );

        return [
            'type' => $type,
            'item' => $this->serializeCreatedUnit($type, $unit),
        ];
    }

    /**
     * @param  Collection<int, Collection<int, Employee>>  $childrenByManager
     * @param  Collection<int|string, int>  $reportCounts
     * @return array<string, mixed>
     */
    private function buildChartNode(Employee $employee, Collection $childrenByManager, Collection $reportCounts): array
    {
        return [
            'id' => $employee->id,
            'employee_number' => $employee->employee_number,
            'name' => $employee->full_name,
            'title' => $employee->job_title,
            'branch' => $employee->branch?->name,
            'department' => $employee->department?->name,
            'division' => $employee->division?->name,
            'section' => $employee->section?->name,
            'position' => $employee->position?->name,
            'manager_id' => $employee->manager_id,
            'reports_count' => (int) ($reportCounts->get($employee->id) ?? 0),
            'children' => $childrenByManager
                ->get($employee->id, collect())
                ->map(fn (Employee $child): array => $this->buildChartNode($child, $childrenByManager, $reportCounts))
                ->values()
                ->all(),
        ];
    }

    /**
     * @param  Collection<int, Employee>  $employees
     * @return array<string, mixed>
     */
    private function serializePosition(Position $position, Collection $employees): array
    {
        return [
            'id' => $position->id,
            'name' => $position->name,
            'code' => $position->code,
            'grade' => $position->grade,
            'description' => $position->description,
            'headcount' => $employees->count(),
            'employees' => $employees
                ->map(fn (Employee $employee): ?array => $this->employeeReference($employee))
                ->filter()
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function employeeReference(?Employee $employee): ?array
    {
        if (! $employee) {
            return null;
        }

        return [
            'id' => $employee->id,
            'employee_number' => $employee->employee_number,
            'full_name' => $employee->full_name,
            'job_title' => $employee->job_title,
            'work_email' => $employee->work_email,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function serializeCreatedUnit(string $type, object $unit): array
    {
        return match ($type) {
            'company' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'legal_name' => $unit->legal_name,
                'email' => $unit->email,
                'phone' => $unit->phone,
                'website' => $unit->website,
                'address' => $unit->address,
                'description' => $unit->description,
            ],
            'branch' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'company_id' => $unit->company_id,
                'address' => $unit->address,
                'phone' => $unit->phone,
                'head_employee_id' => $unit->head_employee_id,
                'is_active' => $unit->is_active,
            ],
            'department' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'cost_center' => $unit->cost_center,
                'description' => $unit->description,
                'head_employee_id' => $unit->head_employee_id,
            ],
            'division' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'department_id' => $unit->department_id,
                'description' => $unit->description,
                'head_employee_id' => $unit->head_employee_id,
            ],
            'section' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'division_id' => $unit->division_id,
                'description' => $unit->description,
                'head_employee_id' => $unit->head_employee_id,
            ],
            'position' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'division_id' => $unit->division_id,
                'section_id' => $unit->section_id,
                'grade' => $unit->grade,
                'description' => $unit->description,
            ],
            default => [],
        };
    }
}
