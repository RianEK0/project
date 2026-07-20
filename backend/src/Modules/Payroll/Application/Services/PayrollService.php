<?php

namespace Modules\Payroll\Application\Services;

use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Domain\Contracts\UserRepository;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceRecord;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollItem;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRun;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRunApproval;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeSalaryHistory;
use Shared\Application\Support\ListQueryOptions;

class PayrollService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly AuditLogService $auditLogs,
        private readonly PayrollExportService $exports,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor): array
    {
        $runs = $this->visibleRunsQuery($actor)
            ->withCount('items')
            ->orderByDesc('payroll_month')
            ->get();
        $latestRun = $runs->first();
        $latestPayslip = $this->visiblePayrollItemsQuery($actor)
            ->whereHas('payrollRun', static fn (Builder $query) => $query->where('status', 'approved'))
            ->with(['employee.department', 'payrollRun'])
            ->orderByDesc(PayrollRun::query()
                ->select('payroll_month')
                ->whereColumn('payroll_runs.id', 'payroll_items.payroll_run_id')
                ->limit(1))
            ->latest('id')
            ->first();
        $month = Carbon::today()->format('Y-m');
        $currentMonthVisibleItems = $this->visiblePayrollItemsQuery($actor)
            ->whereHas('payrollRun', static fn (Builder $query) => $query->where('payroll_month', $month))
            ->get();

        return [
            'current_date' => Carbon::today()->toDateString(),
            'latest_run' => $latestRun,
            'latest_payslip' => $latestPayslip,
            'stats' => [
                'runs_total' => $runs->count(),
                'approved_runs' => $runs->where('status', 'approved')->count(),
                'pending_approvals' => PayrollRunApproval::query()
                    ->where('approver_id', $actor->id)
                    ->where('status', 'pending')
                    ->count(),
                'current_month_net' => round($currentMonthVisibleItems->sum(static fn (PayrollItem $item): float => (float) $item->net_amount), 2),
                'current_month_gross' => round($currentMonthVisibleItems->sum(static fn (PayrollItem $item): float => (float) $item->gross_amount), 2),
                'latest_month' => $latestRun?->payroll_month,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(User $actor): array
    {
        $employees = Employee::query()
            ->with(['department'])
            ->when($this->canViewAllPayroll($actor), static fn (Builder $query) => $query, function (Builder $query) use ($actor): void {
                $employeeId = $actor->employee?->id;

                if ($employeeId) {
                    $query->whereKey($employeeId);

                    return;
                }

                $query->whereRaw('1 = 0');
            })
            ->whereIn('employment_status', ['active', 'probation'])
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();

        return [
            'employees' => $employees,
            'defaults' => [
                'payroll_month' => Carbon::today()->format('Y-m'),
                'period_start' => Carbon::today()->startOfMonth()->toDateString(),
                'period_end' => Carbon::today()->endOfMonth()->toDateString(),
                'tax_rate' => 0.05,
                'bpjs_health_rate' => 0.01,
                'bpjs_employment_rate' => 0.02,
                'overtime_multiplier' => 1.00,
            ],
        ];
    }

    /**
     * @return Collection<int, PayrollRun>
     */
    public function runs(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->visibleRunsQuery($actor)
            ->with(['submitter', 'reviewer', 'approvals.approver'])
            ->withCount('items')
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when(filled($query->filter('payroll_month')), static fn (Builder $builder) => $builder->where('payroll_month', (string) $query->filter('payroll_month')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('payroll_month', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('submitter', static fn (Builder $userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('reviewer', static fn (Builder $userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', static fn (Builder $builder) => $builder->orderByDesc('payroll_month'), function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    'items_count' => $builder->orderBy('items_count', $query->sortDirection),
                    default => $builder->orderBy('payroll_month', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function showRun(User $actor, PayrollRun $payrollRun): PayrollRun
    {
        $this->ensureRunVisible($actor, $payrollRun);

        $payrollRun->load([
            'submitter',
            'reviewer',
            'approvals.approver',
            'items.employee.department',
            'items.employee.position',
        ]);

        if (! $this->canViewAllPayroll($actor)) {
            $employeeId = $actor->employee?->id;
            $payrollRun->setRelation(
                'items',
                $payrollRun->items->where('employee_id', $employeeId)->values(),
            );
        }

        return $payrollRun;
    }

    /**
     * @return Collection<int, PayrollItem>
     */
    public function payslips(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->visiblePayrollItemsQuery($actor)
            ->with(['employee.department', 'employee.position', 'payrollRun'])
            ->whereHas('payrollRun', static fn (Builder $query) => $query->where('status', 'approved'))
            ->when(filled($query->filter('payroll_month')), static fn (Builder $builder) => $builder->whereHas('payrollRun', static fn (Builder $runQuery) => $runQuery->where('payroll_month', (string) $query->filter('payroll_month'))))
            ->when(filled($query->filter('employee_id')), static fn (Builder $builder) => $builder->where('employee_id', (int) $query->filter('employee_id')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->orWhereHas('employee', static fn (Builder $employeeQuery) => $employeeQuery
                            ->where('employee_number', 'like', "%{$search}%")
                            ->orWhere('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%"))
                        ->orWhereHas('payrollRun', static fn (Builder $runQuery) => $runQuery
                            ->where('payroll_month', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByDesc(
                        PayrollRun::query()
                            ->select('payroll_month')
                            ->whereColumn('payroll_runs.id', 'payroll_items.payroll_run_id')
                            ->limit(1),
                    )
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'gross_amount' => $builder->orderBy('gross_amount', $query->sortDirection),
                    'net_amount' => $builder->orderBy('net_amount', $query->sortDirection),
                    default => $builder->orderByDesc(
                        PayrollRun::query()
                            ->select('payroll_month')
                            ->whereColumn('payroll_runs.id', 'payroll_items.payroll_run_id')
                            ->limit(1),
                    )->orderBy('id', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return Collection<int, PayrollRunApproval>
     */
    public function approvalInbox(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return PayrollRunApproval::query()
            ->with(['payrollRun.submitter'])
            ->where('approver_id', $actor->id)
            ->where('status', 'pending')
            ->when(filled($query->filter('stage')), static fn (Builder $builder) => $builder->where('stage', (string) $query->filter('stage')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('stage', 'like', "%{$search}%")
                        ->orWhereHas('payrollRun', static fn (Builder $runQuery) => $runQuery
                            ->where('payroll_month', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', static fn (Builder $builder) => $builder->latest(), function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'stage' => $builder->orderBy('stage', $query->sortDirection),
                    default => $builder->orderBy('created_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function generateRun(User $actor, array $data): PayrollRun
    {
        $periodStart = Carbon::parse($data['period_start']);
        $periodEnd = Carbon::parse($data['period_end']);

        if ($periodEnd->lt($periodStart)) {
            throw ValidationException::withMessages([
                'period_end' => 'Period end must be equal to or after period start.',
            ]);
        }

        $employees = $this->employeesForRun($data, $periodEnd);
        $existingRun = PayrollRun::query()->where('payroll_month', $data['payroll_month'])->first();

        if ($existingRun && $existingRun->status === 'approved') {
            throw ValidationException::withMessages([
                'payroll_month' => 'An approved payroll run already exists for this payroll month.',
            ]);
        }

        return DB::transaction(function () use ($actor, $data, $employees, $existingRun, $periodEnd, $periodStart): PayrollRun {
            $run = $existingRun ?? new PayrollRun();

            $run->fill([
                'payroll_month' => $data['payroll_month'],
                'title' => $data['title'],
                'period_start' => $periodStart->toDateString(),
                'period_end' => $periodEnd->toDateString(),
                'status' => 'draft',
                'overtime_rate_per_hour' => $data['overtime_rate_per_hour'] ?? null,
                'overtime_multiplier' => $data['overtime_multiplier'] ?? 1,
                'tax_rate' => $data['tax_rate'],
                'bpjs_health_rate' => $data['bpjs_health_rate'],
                'bpjs_employment_rate' => $data['bpjs_employment_rate'],
                'submitted_by' => $actor->id,
                'reviewer_id' => null,
                'reviewed_at' => null,
                'rejection_reason' => null,
                'notes' => $data['notes'] ?? null,
                'meta' => [
                    'include_thr' => (bool) ($data['include_thr'] ?? false),
                    'employee_count' => $employees->count(),
                    'formula_note' => 'Tax and BPJS are configurable payroll estimates per run.',
                ],
            ]);
            $run->save();

            if ($existingRun) {
                $run->approvals()->delete();
                $run->items()->delete();
            }

            $adjustments = collect($data['employee_adjustments'] ?? [])->keyBy(
                static fn (array $adjustment): int => (int) $adjustment['employee_id'],
            );

            foreach ($employees as $employee) {
                $adjustment = $adjustments->get($employee->id, []);
                $itemPayload = $this->buildPayrollItemPayload(
                    employee: $employee,
                    run: $run,
                    periodStart: $periodStart,
                    periodEnd: $periodEnd,
                    adjustment: is_array($adjustment) ? $adjustment : [],
                );

                $run->items()->create($itemPayload);
            }

            $this->assignApprovals($run, $actor);
            $run->load(['items.employee.department', 'approvals.approver', 'submitter', 'reviewer']);
            $this->refreshRunSummary($run);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $run,
                action: 'payroll.run.generated',
                summary: "Payroll run {$run->payroll_month} generated by {$actor->name}.",
                newValues: $run->toArray(),
            );

            return $run;
        });
    }

    public function updateItem(PayrollItem $payrollItem, User $actor, array $data): PayrollItem
    {
        if (! $actor->hasPermissionTo('payroll.manage')) {
            throw ValidationException::withMessages([
                'payroll' => 'This account is not allowed to manage payroll items.',
            ]);
        }

        $payrollItem->loadMissing(['payrollRun', 'employee.department', 'employee.position']);

        if ($payrollItem->payrollRun?->status === 'approved') {
            throw ValidationException::withMessages([
                'payroll' => 'Approved payroll items cannot be edited.',
            ]);
        }

        $oldValues = $payrollItem->toArray();
        $allowanceAmount = isset($data['allowance_amount']) ? (float) $data['allowance_amount'] : (float) $payrollItem->allowance_amount;
        $deductionAmount = isset($data['deduction_amount']) ? (float) $data['deduction_amount'] : (float) $payrollItem->deduction_amount;
        $taxAmount = isset($data['tax_amount']) ? (float) $data['tax_amount'] : (float) $payrollItem->tax_amount;
        $bpjsAmount = isset($data['bpjs_amount']) ? (float) $data['bpjs_amount'] : (float) $payrollItem->bpjs_amount;
        $bonusAmount = isset($data['bonus_amount']) ? (float) $data['bonus_amount'] : (float) $payrollItem->bonus_amount;
        $thrAmount = isset($data['thr_amount']) ? (float) $data['thr_amount'] : (float) $payrollItem->thr_amount;
        $grossAmount = round(
            (float) $payrollItem->basic_salary
            + $allowanceAmount
            + (float) $payrollItem->overtime_amount
            + $bonusAmount
            + $thrAmount,
            2,
        );
        $netAmount = round($grossAmount - $deductionAmount - $taxAmount - $bpjsAmount, 2);

        $payrollItem->fill([
            'allowance_amount' => $allowanceAmount,
            'deduction_amount' => $deductionAmount,
            'tax_amount' => $taxAmount,
            'bpjs_amount' => $bpjsAmount,
            'bonus_amount' => $bonusAmount,
            'thr_amount' => $thrAmount,
            'gross_amount' => $grossAmount,
            'net_amount' => $netAmount,
            'notes' => $data['notes'] ?? $payrollItem->notes,
            'meta' => array_merge($payrollItem->meta ?? [], array_filter([
                'allowance_breakdown' => $data['allowance_breakdown'] ?? null,
                'deduction_breakdown' => $data['deduction_breakdown'] ?? null,
            ], static fn (mixed $value): bool => $value !== null)),
        ]);
        $payrollItem->save();

        $payrollItem->load(['payrollRun', 'employee.department', 'employee.position']);
        $this->refreshRunSummary($payrollItem->payrollRun->refresh());

        $this->auditLogs->record(
            actor: $actor,
            auditable: $payrollItem,
            action: 'payroll.item.updated',
            summary: "Payroll item for {$payrollItem->employee?->full_name} updated by {$actor->name}.",
            oldValues: $oldValues,
            newValues: $payrollItem->toArray(),
        );

        return $payrollItem;
    }

    public function approveRun(PayrollRun $payrollRun, User $actor, ?string $remarks = null): PayrollRun
    {
        return DB::transaction(function () use ($payrollRun, $actor, $remarks): PayrollRun {
            $approval = $payrollRun->approvals()
                ->where('approver_id', $actor->id)
                ->where('status', 'pending')
                ->first();

            if (! $approval) {
                throw ValidationException::withMessages([
                    'approval' => 'No pending payroll approval is assigned to this account.',
                ]);
            }

            $approval->fill([
                'status' => 'approved',
                'acted_at' => now(),
                'remarks' => $remarks,
            ])->save();

            /** @var PayrollRunApproval|null $nextApproval */
            $nextApproval = $payrollRun->approvals()
                ->where('status', 'queued')
                ->orderBy('id')
                ->first();

            if ($nextApproval) {
                $nextApproval->fill([
                    'status' => 'pending',
                ])->save();

                $payrollRun->fill([
                    'status' => $nextApproval->stage === 'super-admin' ? 'pending_super_admin' : 'pending_hr',
                ])->save();
            } else {
                $payrollRun->fill([
                    'status' => 'approved',
                    'reviewer_id' => $actor->id,
                    'reviewed_at' => now(),
                    'rejection_reason' => null,
                ])->save();
            }

            $payrollRun->load(['approvals.approver', 'items.employee.department', 'submitter', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $payrollRun,
                action: 'payroll.run.approved',
                summary: "Payroll run {$payrollRun->payroll_month} approved by {$actor->name}.",
                newValues: $payrollRun->toArray(),
            );

            return $payrollRun;
        });
    }

    public function rejectRun(PayrollRun $payrollRun, User $actor, string $remarks): PayrollRun
    {
        return DB::transaction(function () use ($payrollRun, $actor, $remarks): PayrollRun {
            $approval = $payrollRun->approvals()
                ->where('approver_id', $actor->id)
                ->where('status', 'pending')
                ->first();

            if (! $approval) {
                throw ValidationException::withMessages([
                    'approval' => 'No pending payroll approval is assigned to this account.',
                ]);
            }

            $approval->fill([
                'status' => 'rejected',
                'acted_at' => now(),
                'remarks' => $remarks,
            ])->save();

            $payrollRun->fill([
                'status' => 'rejected',
                'reviewer_id' => $actor->id,
                'reviewed_at' => now(),
                'rejection_reason' => $remarks,
            ])->save();

            $payrollRun->load(['approvals.approver', 'items.employee.department', 'submitter', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $payrollRun,
                action: 'payroll.run.rejected',
                summary: "Payroll run {$payrollRun->payroll_month} rejected by {$actor->name}.",
                newValues: $payrollRun->toArray(),
            );

            return $payrollRun;
        });
    }

    public function ensureItemVisible(User $actor, PayrollItem $payrollItem): PayrollItem
    {
        $query = $this->visiblePayrollItemsQuery($actor)->whereKey($payrollItem->id);
        $visibleItem = $query->with(['employee.department', 'employee.position', 'payrollRun'])->first();

        if (! $visibleItem) {
            abort(404);
        }

        return $visibleItem;
    }

    public function payslipPdf(PayrollItem $payrollItem): string
    {
        return $this->exports->buildPayslipPdf($payrollItem);
    }

    public function payrollRunPdf(PayrollRun $payrollRun): string
    {
        return $this->exports->buildPayrollRunPdf($payrollRun);
    }

    public function payrollRunExcel(PayrollRun $payrollRun): string
    {
        return $this->exports->buildPayrollRunExcel($payrollRun);
    }

    private function canViewAllPayroll(User $actor): bool
    {
        return $actor->hasAnyRole(['super-admin', 'hr-manager', 'hr-staff', 'payroll-officer', 'auditor']);
    }

    private function visibleRunsQuery(User $actor): Builder
    {
        return PayrollRun::query()
            ->when($this->canViewAllPayroll($actor), static fn (Builder $query) => $query, function (Builder $query) use ($actor): void {
                $employeeId = $actor->employee?->id;

                if ($employeeId) {
                    $query->whereHas('items', static fn (Builder $itemQuery) => $itemQuery->where('employee_id', $employeeId));

                    return;
                }

                $query->whereRaw('1 = 0');
            });
    }

    private function visiblePayrollItemsQuery(User $actor): Builder
    {
        return PayrollItem::query()
            ->when($this->canViewAllPayroll($actor), static fn (Builder $query) => $query, function (Builder $query) use ($actor): void {
                $employeeId = $actor->employee?->id;

                if ($employeeId) {
                    $query->where('employee_id', $employeeId);

                    return;
                }

                $query->whereRaw('1 = 0');
            });
    }

    private function ensureRunVisible(User $actor, PayrollRun $payrollRun): void
    {
        $exists = $this->visibleRunsQuery($actor)->whereKey($payrollRun->id)->exists();

        if (! $exists) {
            abort(404);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, Employee>
     */
    private function employeesForRun(array $data, CarbonInterface $periodEnd): Collection
    {
        $query = Employee::query()
            ->with([
                'department',
                'position',
                'salaryHistories' => static function ($salaryQuery) use ($periodEnd): void {
                    $salaryQuery
                        ->whereDate('effective_date', '<=', $periodEnd->toDateString())
                        ->where(function (Builder $query) use ($periodEnd): void {
                            $query
                                ->whereNull('end_date')
                                ->orWhereDate('end_date', '>=', $periodEnd->toDateString());
                        })
                        ->orderByDesc('is_current')
                        ->orderByDesc('effective_date')
                        ->orderByDesc('id');
                },
            ])
            ->whereIn('employment_status', ['active', 'probation']);

        if (! empty($data['employee_ids'])) {
            $query->whereIn('id', $data['employee_ids']);
        }

        $employees = $query->orderBy('first_name')->orderBy('last_name')->get();
        $missingSalary = $employees->filter(function (Employee $employee): bool {
            return $employee->salaryHistories->isEmpty();
        });

        if ($missingSalary->isNotEmpty()) {
            throw ValidationException::withMessages([
                'employee_ids' => 'Some selected employees do not have an active salary history: '.$missingSalary->pluck('employee_number')->implode(', ').'.',
            ]);
        }

        return $employees;
    }

    /**
     * @param  array<string, mixed>  $adjustment
     * @return array<string, mixed>
     */
    private function buildPayrollItemPayload(
        Employee $employee,
        PayrollRun $run,
        CarbonInterface $periodStart,
        CarbonInterface $periodEnd,
        array $adjustment = [],
    ): array {
        $salarySnapshot = $this->resolveSalarySnapshot($employee);
        $basicSalary = $salarySnapshot['basic_salary'];
        $allowanceAmount = array_key_exists('allowance_amount', $adjustment)
            ? (float) $adjustment['allowance_amount']
            : $salarySnapshot['allowance_amount'];
        $deductionAmount = (float) ($adjustment['deduction_amount'] ?? 0);
        $bonusAmount = (float) ($adjustment['bonus_amount'] ?? 0);
        $thrAmount = array_key_exists('thr_amount', $adjustment)
            ? (float) $adjustment['thr_amount']
            : ((bool) ($run->meta['include_thr'] ?? false) ? round($basicSalary + $allowanceAmount, 2) : 0.0);
        $overtimeMinutes = $this->resolveOvertimeMinutes($employee, $periodStart, $periodEnd);
        $hourlyRate = $run->overtime_rate_per_hour !== null
            ? (float) $run->overtime_rate_per_hour
            : round($basicSalary / 173, 2);
        $overtimeAmount = round(($overtimeMinutes / 60) * $hourlyRate * (float) $run->overtime_multiplier, 2);
        $bpjsAmount = array_key_exists('bpjs_amount', $adjustment)
            ? (float) $adjustment['bpjs_amount']
            : round(($basicSalary + $allowanceAmount) * ((float) $run->bpjs_health_rate + (float) $run->bpjs_employment_rate), 2);
        $grossAmount = round($basicSalary + $allowanceAmount + $overtimeAmount + $bonusAmount + $thrAmount, 2);
        $taxAmount = array_key_exists('tax_amount', $adjustment)
            ? (float) $adjustment['tax_amount']
            : round($grossAmount * (float) $run->tax_rate, 2);
        $netAmount = round($grossAmount - $deductionAmount - $taxAmount - $bpjsAmount, 2);

        return [
            'employee_id' => $employee->id,
            'currency' => $salarySnapshot['currency'],
            'basic_salary' => $basicSalary,
            'allowance_amount' => $allowanceAmount,
            'deduction_amount' => $deductionAmount,
            'tax_amount' => $taxAmount,
            'bpjs_amount' => $bpjsAmount,
            'overtime_minutes' => $overtimeMinutes,
            'overtime_amount' => $overtimeAmount,
            'bonus_amount' => $bonusAmount,
            'thr_amount' => $thrAmount,
            'gross_amount' => $grossAmount,
            'net_amount' => $netAmount,
            'notes' => $adjustment['notes'] ?? null,
            'generated_at' => now(),
            'meta' => [
                'salary_breakdown' => $salarySnapshot['breakdown'],
                'allowance_breakdown' => $adjustment['allowance_breakdown'] ?? $salarySnapshot['allowance_breakdown'],
                'deduction_breakdown' => $adjustment['deduction_breakdown'] ?? [],
                'formula' => [
                    'overtime_rate_per_hour' => $hourlyRate,
                    'overtime_multiplier' => (float) $run->overtime_multiplier,
                    'tax_rate' => (float) $run->tax_rate,
                    'bpjs_health_rate' => (float) $run->bpjs_health_rate,
                    'bpjs_employment_rate' => (float) $run->bpjs_employment_rate,
                ],
                'employee_number' => $employee->employee_number,
                'employee_name' => $employee->full_name,
            ],
        ];
    }

    /**
     * @return array{
     *   basic_salary: float,
     *   allowance_amount: float,
     *   currency: string,
     *   breakdown: array<int, array<string, mixed>>,
     *   allowance_breakdown: array<int, array<string, mixed>>
     * }
     */
    private function resolveSalarySnapshot(Employee $employee): array
    {
        $histories = $employee->salaryHistories->values();
        /** @var EmployeeSalaryHistory|null $baseSalaryHistory */
        $baseSalaryHistory = $histories->first(function (EmployeeSalaryHistory $history): bool {
            return str_contains(strtolower($history->component), 'base salary');
        }) ?? $histories->first();

        if (! $baseSalaryHistory) {
            throw ValidationException::withMessages([
                'employee' => "Employee {$employee->employee_number} does not have a salary history that can be used for payroll.",
            ]);
        }

        $allowanceHistories = $histories->reject(static fn (EmployeeSalaryHistory $history): bool => $history->id === $baseSalaryHistory->id);

        return [
            'basic_salary' => (float) $baseSalaryHistory->amount,
            'allowance_amount' => round($allowanceHistories->sum(static fn (EmployeeSalaryHistory $history): float => (float) $history->amount), 2),
            'currency' => $baseSalaryHistory->currency ?: 'IDR',
            'breakdown' => $histories->map(static fn (EmployeeSalaryHistory $history): array => [
                'component' => $history->component,
                'amount' => (float) $history->amount,
                'currency' => $history->currency,
                'pay_frequency' => $history->pay_frequency,
            ])->values()->all(),
            'allowance_breakdown' => $allowanceHistories->map(static fn (EmployeeSalaryHistory $history): array => [
                'component' => $history->component,
                'amount' => (float) $history->amount,
                'currency' => $history->currency,
            ])->values()->all(),
        ];
    }

    private function resolveOvertimeMinutes(Employee $employee, CarbonInterface $periodStart, CarbonInterface $periodEnd): int
    {
        return (int) AttendanceRecord::query()
            ->where('employee_id', $employee->id)
            ->whereDate('attendance_date', '>=', $periodStart->toDateString())
            ->whereDate('attendance_date', '<=', $periodEnd->toDateString())
            ->sum('overtime_minutes');
    }

    private function assignApprovals(PayrollRun $run, User $actor): void
    {
        $hrApprover = User::query()
            ->whereHas('roles', static fn (Builder $query) => $query->where('name', 'hr-manager'))
            ->when(! $actor->hasRole('hr-manager'), static fn (Builder $query) => $query->whereKeyNot($actor->id))
            ->orderBy('id')
            ->first();
        $superAdminApprover = $this->users->administrators()
            ->reject(static fn (User $user) => $user->id === $actor->id)
            ->values()
            ->first();

        if ($actor->hasRole('super-admin')) {
            $run->fill([
                'status' => 'approved',
                'reviewer_id' => $actor->id,
                'reviewed_at' => now(),
            ])->save();

            return;
        }

        if ($actor->hasRole('hr-manager') && $superAdminApprover) {
            $run->approvals()->create([
                'approver_id' => $superAdminApprover->id,
                'stage' => 'super-admin',
                'status' => 'pending',
            ]);

            $run->fill([
                'status' => 'pending_super_admin',
            ])->save();

            return;
        }

        if ($hrApprover) {
            $run->approvals()->create([
                'approver_id' => $hrApprover->id,
                'stage' => 'hr',
                'status' => 'pending',
            ]);

            $run->fill([
                'status' => 'pending_hr',
            ])->save();

            if ($superAdminApprover && $superAdminApprover->id !== $hrApprover->id) {
                $run->approvals()->create([
                    'approver_id' => $superAdminApprover->id,
                    'stage' => 'super-admin',
                    'status' => 'queued',
                ]);
            }

            return;
        }

        if ($superAdminApprover) {
            $run->approvals()->create([
                'approver_id' => $superAdminApprover->id,
                'stage' => 'super-admin',
                'status' => 'pending',
            ]);

            $run->fill([
                'status' => 'pending_super_admin',
            ])->save();

            return;
        }

        $run->fill([
            'status' => 'approved',
            'reviewer_id' => $actor->id,
            'reviewed_at' => now(),
        ])->save();
    }

    private function refreshRunSummary(PayrollRun $run): void
    {
        $run->loadMissing('items');

        $summary = [
            'employees_count' => $run->items->count(),
            'basic_salary_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->basic_salary), 2),
            'allowance_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->allowance_amount), 2),
            'deduction_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->deduction_amount), 2),
            'tax_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->tax_amount), 2),
            'bpjs_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->bpjs_amount), 2),
            'overtime_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->overtime_amount), 2),
            'bonus_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->bonus_amount), 2),
            'thr_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->thr_amount), 2),
            'gross_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->gross_amount), 2),
            'net_total' => round($run->items->sum(static fn (PayrollItem $item): float => (float) $item->net_amount), 2),
        ];

        $run->fill([
            'meta' => array_merge($run->meta ?? [], [
                'summary' => $summary,
            ]),
        ])->save();
    }
}
