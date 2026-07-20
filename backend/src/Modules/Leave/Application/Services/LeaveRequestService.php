<?php

namespace Modules\Leave\Application\Services;

use App\Events\Leave\LeaveRequestSubmitted;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Domain\Contracts\UserRepository;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceHoliday;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Leave\Application\DTO\LeaveRequestData;
use Modules\Leave\Domain\Contracts\LeaveRequestRepository;
use Modules\Leave\Domain\Contracts\LeaveTypeRepository;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveBalance;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\CollectionPaginator;
use Shared\Application\Support\CollectionQuery;
use Shared\Application\Support\ListQueryOptions;

class LeaveRequestService
{
    public function __construct(
        private readonly LeaveRequestRepository $leaveRequests,
        private readonly LeaveTypeRepository $leaveTypes,
        private readonly UserRepository $users,
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return Collection<int, \Modules\Leave\Infrastructure\Persistence\Models\LeaveType>
     */
    public function leaveTypes(ListQueryOptions $query): LengthAwarePaginator
    {
        $items = CollectionQuery::search(
            $this->leaveTypes->active(),
            $query->search,
            static fn (LeaveType $leaveType): array => [$leaveType->name, $leaveType->code, $leaveType->description],
        );
        $items = $items
            ->when(
                filter_var($query->filter('deducts_balance'), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) !== null,
                static fn (Collection $collection) => $collection->where('deducts_balance', filter_var($query->filter('deducts_balance'), FILTER_VALIDATE_BOOL)),
            )
            ->values();
        $items = CollectionQuery::sort($items, $query, static fn (LeaveType $leaveType, string $sortBy): mixed => match ($sortBy) {
            'code' => $leaveType->code,
            default => $leaveType->name,
        });

        return CollectionPaginator::paginate($items, $query);
    }

    /**
     * @return Collection<int, LeaveRequest>
     */
    public function visibleRequests(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        $items = $this->leaveRequests->visibleTo($actor)
            ->when(filled($query->filter('employee_id')), static fn (Collection $collection) => $collection->where('employee_id', (int) $query->filter('employee_id')))
            ->when(filled($query->filter('status')), static fn (Collection $collection) => $collection->where('status', (string) $query->filter('status')))
            ->when(filled($query->filter('leave_type_id')), static fn (Collection $collection) => $collection->where('leave_type_id', (int) $query->filter('leave_type_id')))
            ->values();
        $items = CollectionQuery::search(
            $items,
            $query->search,
            static fn (LeaveRequest $leaveRequest): array => [
                $leaveRequest->employee?->employee_number,
                $leaveRequest->employee?->full_name,
                $leaveRequest->leaveType?->name,
                $leaveRequest->status,
                $leaveRequest->reason,
            ],
        );
        $items = CollectionQuery::sort($items, $query, static fn (LeaveRequest $leaveRequest, string $sortBy): mixed => match ($sortBy) {
            'start_date' => $leaveRequest->start_date?->timestamp,
            'end_date' => $leaveRequest->end_date?->timestamp,
            'status' => $leaveRequest->status,
            default => $leaveRequest->submitted_at?->timestamp ?? $leaveRequest->created_at?->timestamp,
        });

        return CollectionPaginator::paginate($items, $query);
    }

    /**
     * @return Collection<int, LeaveApproval>
     */
    public function approvalInbox(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        $items = $this->leaveRequests->approvalInbox($actor)
            ->when(filled($query->filter('status')), static fn (Collection $collection) => $collection->where('status', (string) $query->filter('status')))
            ->values();
        $items = CollectionQuery::search(
            $items,
            $query->search,
            static fn ($approval): array => [
                $approval->stage,
                $approval->status,
                $approval->leaveRequest?->employee?->employee_number,
                $approval->leaveRequest?->employee?->full_name,
                $approval->leaveRequest?->leaveType?->name,
            ],
        );
        $items = CollectionQuery::sort($items, $query, static fn ($approval, string $sortBy): mixed => match ($sortBy) {
            'stage' => $approval->stage,
            'status' => $approval->status,
            default => $approval->created_at?->timestamp,
        });

        return CollectionPaginator::paginate($items, $query);
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor, ?int $employeeId = null): array
    {
        $today = Carbon::today();
        $employee = $this->resolveEmployeeForLeaveWorkspace($actor, $employeeId);
        $balances = $employee ? $this->balancesForEmployee($employee, (int) $today->year) : collect();
        $visibleRequests = $this->leaveRequests->visibleTo($actor);
        $pendingApprovals = $this->leaveRequests->approvalInbox($actor);
        $upcomingApproved = $visibleRequests
            ->filter(fn (LeaveRequest $leaveRequest): bool => $leaveRequest->status === 'approved')
            ->filter(fn (LeaveRequest $leaveRequest): bool => $leaveRequest->start_date !== null && $leaveRequest->start_date->betweenIncluded($today, $today->copy()->addDays(30)))
            ->values();
        $holidays = AttendanceHoliday::query()
            ->whereDate('holiday_date', '>=', $today)
            ->whereDate('holiday_date', '<=', $today->copy()->addDays(45))
            ->orderBy('holiday_date')
            ->get();

        return [
            'date' => $today->toDateString(),
            'employee' => $employee,
            'balances' => $balances,
            'holidays' => $holidays,
            'reminders' => $this->buildReminders(
                actor: $actor,
                employee: $employee,
                balances: $balances,
                pendingApprovals: $pendingApprovals,
                upcomingApproved: $upcomingApproved,
                holidays: $holidays,
            ),
            'stats' => [
                'visible_requests' => $visibleRequests->count(),
                'pending_requests' => $visibleRequests->filter(fn (LeaveRequest $leaveRequest): bool => str_starts_with($leaveRequest->status, 'pending'))->count(),
                'pending_approvals' => $pendingApprovals->count(),
                'upcoming_approved' => $upcomingApproved->count(),
                'upcoming_holidays' => $holidays->count(),
                'available_days_total' => round($balances->sum(static fn (LeaveBalance $balance): float => (float) $balance->available_days), 2),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function calendar(User $actor, string $month, ?int $employeeId = null): array
    {
        $monthDate = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
        $gridStart = $monthDate->copy()->startOfWeek(Carbon::MONDAY);
        $gridEnd = $monthDate->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);
        $employee = $this->resolveEmployeeForLeaveWorkspace($actor, $employeeId);
        $visibleRequests = $this->leaveRequests->visibleTo($actor)
            ->when($employee !== null, fn (Collection $requests): Collection => $requests->where('employee_id', $employee->id))
            ->filter(function (LeaveRequest $leaveRequest) use ($gridStart, $gridEnd): bool {
                return $leaveRequest->start_date !== null
                    && $leaveRequest->end_date !== null
                    && $leaveRequest->start_date->lte($gridEnd)
                    && $leaveRequest->end_date->gte($gridStart);
            })
            ->values();
        $holidays = AttendanceHoliday::query()
            ->whereDate('holiday_date', '>=', $gridStart)
            ->whereDate('holiday_date', '<=', $gridEnd)
            ->orderBy('holiday_date')
            ->get()
            ->keyBy(static fn (AttendanceHoliday $holiday): string => $holiday->holiday_date->toDateString());

        $days = [];

        for ($cursor = $gridStart->copy(); $cursor->lte($gridEnd); $cursor->addDay()) {
            $dateKey = $cursor->toDateString();
            /** @var AttendanceHoliday|null $holiday */
            $holiday = $holidays->get($dateKey);
            $events = [];

            if ($holiday) {
                $events[] = [
                    'type' => 'holiday',
                    'title' => $holiday->name,
                    'status' => $holiday->type,
                    'color' => '#b45309',
                ];
            }

            foreach ($visibleRequests as $leaveRequest) {
                if (! $leaveRequest->start_date || ! $leaveRequest->end_date) {
                    continue;
                }

                if ($cursor->betweenIncluded($leaveRequest->start_date, $leaveRequest->end_date)) {
                    $events[] = [
                        'type' => 'leave',
                        'title' => ($leaveRequest->employee?->full_name ?? 'Employee').' · '.($leaveRequest->leaveType?->name ?? 'Leave'),
                        'status' => $leaveRequest->status,
                        'color' => $leaveRequest->leaveType?->color,
                        'leave_request_id' => $leaveRequest->id,
                    ];
                }
            }

            $days[] = [
                'date' => $dateKey,
                'day' => (int) $cursor->day,
                'is_current_month' => $cursor->month === $monthDate->month,
                'is_weekend' => $cursor->isWeekend(),
                'holiday' => $holiday ? [
                    'id' => $holiday->id,
                    'name' => $holiday->name,
                    'type' => $holiday->type,
                ] : null,
                'events' => $events,
            ];
        }

        return [
            'month' => $monthDate->format('Y-m'),
            'month_label' => $monthDate->translatedFormat('F Y'),
            'starts_on' => $gridStart->toDateString(),
            'ends_on' => $gridEnd->toDateString(),
            'employee' => $employee,
            'days' => $days,
        ];
    }

    public function create(LeaveRequestData $data, User $actor): LeaveRequest
    {
        /** @var Employee|null $employee */
        $employee = $actor->employee()->with(['manager.user'])->first();

        if (! $employee) {
            throw ValidationException::withMessages([
                'employee' => 'Your account is not linked to an employee profile.',
            ]);
        }

        $startDate = Carbon::parse($data->start_date);
        $endDate = Carbon::parse($data->end_date);
        /** @var LeaveType $leaveType */
        $leaveType = LeaveType::query()
            ->where('is_active', true)
            ->findOrFail($data->leave_type_id);

        if ($endDate->lt($startDate)) {
            throw ValidationException::withMessages([
                'end_date' => 'End date must be equal to or after start date.',
            ]);
        }

        if ($this->hasOverlappingLeave($employee, $startDate, $endDate)) {
            throw ValidationException::withMessages([
                'start_date' => 'This leave period overlaps an existing pending or approved leave request.',
            ]);
        }

        $calculation = $this->calculateLeaveDays($leaveType, $startDate, $endDate);
        $totalDays = $calculation['total_days'];

        if ($totalDays <= 0) {
            throw ValidationException::withMessages([
                'start_date' => 'This leave range does not contain any deductible leave day after weekend and holiday rules are applied.',
            ]);
        }

        if ($leaveType->deducts_balance) {
            $this->ensureSufficientBalance($employee, $leaveType, $calculation['balance_by_year']);
        }

        return DB::transaction(function () use ($data, $actor, $employee, $totalDays): LeaveRequest {
            $leaveType = LeaveType::query()->findOrFail($data->leave_type_id);
            $startDate = Carbon::parse($data->start_date);
            $endDate = Carbon::parse($data->end_date);
            $calculation = $this->calculateLeaveDays($leaveType, $startDate, $endDate);
            $leaveRequest = $this->leaveRequests->create([
                'employee_id' => $employee->id,
                'leave_type_id' => $data->leave_type_id,
                'start_date' => $data->start_date,
                'end_date' => $data->end_date,
                'total_days' => $totalDays,
                'reason' => $data->reason,
                'status' => 'draft',
                'submitted_at' => now(),
                'meta' => array_merge($data->meta ?? [], [
                    'calendar_days' => $calculation['calendar_days'],
                    'balance_days' => $calculation['total_days'],
                    'counted_dates' => $calculation['counted_dates'],
                    'skipped_weekends' => $calculation['skipped_weekends'],
                    'skipped_holidays' => $calculation['skipped_holidays'],
                    'balance_by_year' => $calculation['balance_by_year'],
                ]),
            ]);

            $managerApprover = $employee->manager?->user;
            $hrApprover = User::query()
                ->whereHas('roles', static fn ($query) => $query->where('name', 'hr-manager'))
                ->whereKeyNot($actor->id)
                ->orderBy('id')
                ->first()
                ?? $this->users->administrators()
                    ->reject(static fn (User $user) => $user->id === $actor->id)
                    ->values()
                    ->first();

            $currentApproval = null;

            if ($managerApprover && $managerApprover->id !== $actor->id) {
                $currentApproval = $this->leaveRequests->createApproval([
                    'leave_request_id' => $leaveRequest->id,
                    'approver_id' => $managerApprover->id,
                    'stage' => 'manager',
                    'status' => 'pending',
                ]);

                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'pending_manager',
                ]);

                if ($hrApprover && $hrApprover->id !== $managerApprover->id) {
                    $this->leaveRequests->createApproval([
                        'leave_request_id' => $leaveRequest->id,
                        'approver_id' => $hrApprover->id,
                        'stage' => 'hr',
                        'status' => 'queued',
                    ]);
                }
            } elseif ($hrApprover) {
                $currentApproval = $this->leaveRequests->createApproval([
                    'leave_request_id' => $leaveRequest->id,
                    'approver_id' => $hrApprover->id,
                    'stage' => 'hr',
                    'status' => 'pending',
                ]);

                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'pending_hr',
                ]);
            } else {
                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'approved',
                    'reviewer_id' => $actor->id,
                    'reviewed_at' => now(),
                ]);
            }

            if ($leaveType->deducts_balance) {
                if ($leaveRequest->status === 'approved') {
                    $this->commitUsedBalance($employee, $leaveType, $calculation['balance_by_year']);
                } else {
                    $this->reserveBalance($employee, $leaveType, $calculation['balance_by_year']);
                }
            }

            $leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType', 'approvals.approver', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $leaveRequest,
                action: 'leave-request.created',
                summary: "Leave request #{$leaveRequest->id} submitted by {$actor->name}.",
                newValues: $leaveRequest->toArray(),
            );

            if ($currentApproval) {
                LeaveRequestSubmitted::dispatch($leaveRequest, $currentApproval);
            }

            return $leaveRequest;
        });
    }

    public function approve(LeaveRequest $leaveRequest, User $actor, ?string $remarks = null): LeaveRequest
    {
        return DB::transaction(function () use ($leaveRequest, $actor, $remarks): LeaveRequest {
            $approval = $this->leaveRequests->pendingApprovalForUser($leaveRequest, $actor);

            if (! $approval) {
                throw ValidationException::withMessages([
                    'approval' => 'No pending approval was assigned to this account.',
                ]);
            }

            $this->leaveRequests->updateApproval($approval, [
                'status' => 'approved',
                'acted_at' => now(),
                'remarks' => $remarks,
            ]);

            $nextApproval = $leaveRequest->approvals()
                ->where('status', 'queued')
                ->orderBy('id')
                ->first();

            if ($nextApproval) {
                $this->leaveRequests->updateApproval($nextApproval, [
                    'status' => 'pending',
                ]);

                $status = $nextApproval->stage === 'hr' ? 'pending_hr' : 'pending_manager';
                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => $status,
                ]);

                LeaveRequestSubmitted::dispatch($leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType']), $nextApproval->refresh());
            } else {
                $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                    'status' => 'approved',
                    'reviewer_id' => $actor->id,
                    'reviewed_at' => now(),
                ]);

                if ($leaveRequest->leaveType?->deducts_balance) {
                    $this->convertPendingBalanceToUsed($leaveRequest);
                }
            }

            $leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType', 'approvals.approver', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $leaveRequest,
                action: 'leave-request.approved',
                summary: "Leave request #{$leaveRequest->id} approved by {$actor->name}.",
                newValues: $leaveRequest->toArray(),
            );

            return $leaveRequest;
        });
    }

    public function reject(LeaveRequest $leaveRequest, User $actor, string $remarks): LeaveRequest
    {
        return DB::transaction(function () use ($leaveRequest, $actor, $remarks): LeaveRequest {
            $approval = $this->leaveRequests->pendingApprovalForUser($leaveRequest, $actor);

            if (! $approval) {
                throw ValidationException::withMessages([
                    'approval' => 'No pending approval was assigned to this account.',
                ]);
            }

            $this->leaveRequests->updateApproval($approval, [
                'status' => 'rejected',
                'acted_at' => now(),
                'remarks' => $remarks,
            ]);

            $leaveRequest = $this->leaveRequests->update($leaveRequest, [
                'status' => 'rejected',
                'reviewer_id' => $actor->id,
                'reviewed_at' => now(),
                'rejection_reason' => $remarks,
            ]);

            if ($leaveRequest->leaveType?->deducts_balance) {
                $this->releaseReservedBalance($leaveRequest);
            }

            $leaveRequest->loadMissing(['employee.department', 'employee.team', 'leaveType', 'approvals.approver', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $leaveRequest,
                action: 'leave-request.rejected',
                summary: "Leave request #{$leaveRequest->id} rejected by {$actor->name}.",
                newValues: $leaveRequest->toArray(),
            );

            return $leaveRequest;
        });
    }

    /**
     * @return Collection<int, LeaveBalance>
     */
    private function balancesForEmployee(Employee $employee, int $year): Collection
    {
        $balanceTypes = LeaveType::query()
            ->where('is_active', true)
            ->where('deducts_balance', true)
            ->orderBy('name')
            ->get();

        foreach ($balanceTypes as $leaveType) {
            LeaveBalance::query()->firstOrCreate(
                [
                    'employee_id' => $employee->id,
                    'leave_type_id' => $leaveType->id,
                    'year' => $year,
                ],
                [
                    'allocated_days' => $leaveType->default_days,
                    'carried_over_days' => $leaveType->code === 'ANNUAL' ? 2 : 0,
                    'used_days' => 0,
                    'pending_days' => 0,
                    'adjustment_days' => 0,
                ],
            );
        }

        return LeaveBalance::query()
            ->with(['leaveType', 'employee.department'])
            ->where('employee_id', $employee->id)
            ->where('year', $year)
            ->orderBy('leave_type_id')
            ->get();
    }

    private function resolveEmployeeForLeaveWorkspace(User $actor, ?int $employeeId = null): ?Employee
    {
        if ($employeeId === null) {
            return $actor->employee()->with(['department', 'manager.user'])->first();
        }

        /** @var Employee|null $employee */
        $employee = Employee::query()->with(['department', 'manager.user', 'user'])->find($employeeId);

        if (! $employee) {
            return null;
        }

        if ($employee->user_id === $actor->id) {
            return $employee;
        }

        if ($actor->hasAnyRole(['super-admin', 'hr-manager', 'hr-staff', 'auditor'])) {
            return $employee;
        }

        if ($actor->hasRole('department-manager') && $employee->manager?->user_id === $actor->id) {
            return $employee;
        }

        throw ValidationException::withMessages([
            'employee_id' => 'This account is not allowed to inspect the selected employee leave balance.',
        ]);
    }

    private function hasOverlappingLeave(Employee $employee, CarbonInterface $startDate, CarbonInterface $endDate): bool
    {
        return LeaveRequest::query()
            ->where('employee_id', $employee->id)
            ->where('status', '!=', 'rejected')
            ->whereDate('start_date', '<=', $endDate)
            ->whereDate('end_date', '>=', $startDate)
            ->exists();
    }

    /**
     * @return array{
     *   total_days: float,
     *   calendar_days: int,
     *   counted_dates: array<int, string>,
     *   skipped_weekends: array<int, string>,
     *   skipped_holidays: array<int, string>,
     *   balance_by_year: array<string, float>
     * }
     */
    private function calculateLeaveDays(LeaveType $leaveType, CarbonInterface $startDate, CarbonInterface $endDate): array
    {
        $holidayDates = AttendanceHoliday::query()
            ->whereDate('holiday_date', '>=', $startDate->toDateString())
            ->whereDate('holiday_date', '<=', $endDate->toDateString())
            ->pluck('holiday_date')
            ->map(static fn ($date): string => Carbon::parse($date)->toDateString())
            ->all();
        $holidayLookup = array_fill_keys($holidayDates, true);
        $countedDates = [];
        $skippedWeekends = [];
        $skippedHolidays = [];

        for ($cursor = $startDate->copy(); $cursor->lte($endDate); $cursor->addDay()) {
            $dateKey = $cursor->toDateString();
            $isWeekend = $cursor->isWeekend();
            $isHoliday = isset($holidayLookup[$dateKey]);

            if ($isWeekend && ! $leaveType->count_weekends) {
                $skippedWeekends[] = $dateKey;

                continue;
            }

            if ($isHoliday && ! $leaveType->count_holidays) {
                $skippedHolidays[] = $dateKey;

                continue;
            }

            $countedDates[] = $dateKey;
        }

        $balanceByYear = [];

        foreach ($countedDates as $date) {
            $year = Carbon::parse($date)->format('Y');
            $balanceByYear[$year] = ($balanceByYear[$year] ?? 0) + 1;
        }

        return [
            'total_days' => (float) count($countedDates),
            'calendar_days' => (int) $startDate->diffInDays($endDate) + 1,
            'counted_dates' => $countedDates,
            'skipped_weekends' => $skippedWeekends,
            'skipped_holidays' => $skippedHolidays,
            'balance_by_year' => $balanceByYear,
        ];
    }

    /**
     * @param  array<string, float>  $balanceByYear
     */
    private function ensureSufficientBalance(Employee $employee, LeaveType $leaveType, array $balanceByYear): void
    {
        foreach ($balanceByYear as $year => $days) {
            $balance = $this->resolveBalance($employee, $leaveType, (int) $year);

            if ((float) $balance->available_days < (float) $days) {
                throw ValidationException::withMessages([
                    'leave_type_id' => "Insufficient {$leaveType->name} balance for {$year}. Available: {$balance->available_days} days.",
                ]);
            }
        }
    }

    private function resolveBalance(Employee $employee, LeaveType $leaveType, int $year): LeaveBalance
    {
        return LeaveBalance::query()->firstOrCreate(
            [
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'year' => $year,
            ],
            [
                'allocated_days' => $leaveType->default_days,
                'carried_over_days' => $leaveType->code === 'ANNUAL' ? 2 : 0,
                'used_days' => 0,
                'pending_days' => 0,
                'adjustment_days' => 0,
            ],
        );
    }

    /**
     * @param  array<string, float>  $balanceByYear
     */
    private function reserveBalance(Employee $employee, LeaveType $leaveType, array $balanceByYear): void
    {
        foreach ($balanceByYear as $year => $days) {
            $balance = $this->resolveBalance($employee, $leaveType, (int) $year);
            $balance->increment('pending_days', $days);
        }
    }

    /**
     * @param  array<string, float>  $balanceByYear
     */
    private function commitUsedBalance(Employee $employee, LeaveType $leaveType, array $balanceByYear): void
    {
        foreach ($balanceByYear as $year => $days) {
            $balance = $this->resolveBalance($employee, $leaveType, (int) $year);
            $balance->increment('used_days', $days);
        }
    }

    private function convertPendingBalanceToUsed(LeaveRequest $leaveRequest): void
    {
        $leaveRequest->loadMissing(['employee', 'leaveType']);

        foreach ($this->balanceImpactForRequest($leaveRequest) as $year => $days) {
            $balance = $this->resolveBalance($leaveRequest->employee, $leaveRequest->leaveType, (int) $year);
            $balance->decrement('pending_days', $days);
            $balance->increment('used_days', $days);
        }
    }

    private function releaseReservedBalance(LeaveRequest $leaveRequest): void
    {
        $leaveRequest->loadMissing(['employee', 'leaveType']);

        foreach ($this->balanceImpactForRequest($leaveRequest) as $year => $days) {
            $balance = $this->resolveBalance($leaveRequest->employee, $leaveRequest->leaveType, (int) $year);
            $balance->decrement('pending_days', $days);
        }
    }

    /**
     * @return array<string, float>
     */
    private function balanceImpactForRequest(LeaveRequest $leaveRequest): array
    {
        $meta = $leaveRequest->meta ?? [];
        $impacts = $meta['balance_by_year'] ?? [];

        if (is_array($impacts) && $impacts !== []) {
            return array_map(static fn ($value): float => (float) $value, $impacts);
        }

        /** @var LeaveType $leaveType */
        $leaveType = $leaveRequest->leaveType;
        $calculation = $this->calculateLeaveDays($leaveType, $leaveRequest->start_date, $leaveRequest->end_date);

        return $calculation['balance_by_year'];
    }

    /**
     * @param  Collection<int, LeaveBalance>  $balances
     * @param  Collection<int, LeaveApproval>  $pendingApprovals
     * @param  Collection<int, LeaveRequest>  $upcomingApproved
     * @param  Collection<int, AttendanceHoliday>  $holidays
     * @return array<int, array<string, mixed>>
     */
    private function buildReminders(
        User $actor,
        ?Employee $employee,
        Collection $balances,
        Collection $pendingApprovals,
        Collection $upcomingApproved,
        Collection $holidays,
    ): array {
        $reminders = [];

        foreach ($balances as $balance) {
            if ((float) $balance->available_days > 3) {
                continue;
            }

            $reminders[] = [
                'type' => 'low_balance',
                'severity' => (float) $balance->available_days <= 1 ? 'danger' : 'warning',
                'title' => ($balance->leaveType?->name ?? 'Leave').' balance is running low',
                'description' => "Available balance: {$balance->available_days} day(s) in {$balance->year}.",
                'date' => (string) $balance->year,
            ];
        }

        foreach ($pendingApprovals->take(4) as $approval) {
            $reminders[] = [
                'type' => 'approval',
                'severity' => 'warning',
                'title' => 'Leave approval pending',
                'description' => ($approval->leaveRequest?->employee?->full_name ?? 'Employee').' is waiting for your '.$approval->stage.' approval.',
                'date' => $approval->leaveRequest?->start_date?->toDateString(),
            ];
        }

        foreach ($upcomingApproved->take($actor->hasPermissionTo('leave-requests.approve') ? 4 : 2) as $leaveRequest) {
            $reminders[] = [
                'type' => 'upcoming_leave',
                'severity' => 'neutral',
                'title' => ($employee && $leaveRequest->employee_id === $employee->id)
                    ? 'Your approved leave is coming up'
                    : 'Approved team leave is coming up',
                'description' => ($leaveRequest->employee?->full_name ?? 'Employee').' starts '.($leaveRequest->leaveType?->name ?? 'leave').' on '.$leaveRequest->start_date?->toDateString().'.',
                'date' => $leaveRequest->start_date?->toDateString(),
            ];
        }

        foreach ($holidays->take(3) as $holiday) {
            $reminders[] = [
                'type' => 'holiday',
                'severity' => 'success',
                'title' => 'Upcoming holiday',
                'description' => "{$holiday->name} ({$holiday->type}) is on {$holiday->holiday_date?->toDateString()}.",
                'date' => $holiday->holiday_date?->toDateString(),
            ];
        }

        return $reminders;
    }
}
