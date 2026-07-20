<?php

namespace Modules\Performance\Application\Services;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceCycle;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceFeedback;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceGoal;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceReview;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\ListQueryOptions;

class PerformanceService
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor): array
    {
        $goalBase = $this->goalsQueryForActor($actor);
        $reviewBase = $this->reviewsQueryForActor($actor);
        $feedbackBase = $this->feedbackQueryForActor($actor);

        $pendingReviews = (clone $reviewBase)
            ->with($this->reviewRelations())
            ->whereIn('status', ['draft', 'employee_submitted', 'manager_submitted'])
            ->orderBy('cycle_id')
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $recentFeedback = (clone $feedbackBase)
            ->with($this->feedbackRelations())
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->limit(6)
            ->get();

        $cycles = $this->defaultCyclesCollection($actor);
        $cycleSnapshot = $cycles->take(4)->values();

        return [
            'current_date' => today()->toDateString(),
            'stats' => [
                'active_cycles' => $cycles->where('status', 'active')->count(),
                'visible_goals' => (clone $goalBase)->count(),
                'completed_goals' => (clone $goalBase)->where('status', 'completed')->count(),
                'open_reviews' => (clone $reviewBase)->where('status', '!=', 'completed')->count(),
                'feedback_responses' => (clone $feedbackBase)->count(),
                'average_goal_progress' => round((float) ((clone $goalBase)->avg('progress_percent') ?? 0), 2),
                'average_review_score' => round((float) ((clone $reviewBase)->avg('overall_score') ?? 0), 2),
            ],
            'goal_distribution' => (clone $goalBase)
                ->selectRaw('goal_type, COUNT(*) as aggregate')
                ->groupBy('goal_type')
                ->orderBy('goal_type')
                ->get()
                ->map(static fn (PerformanceGoal $goal): array => [
                    'goal_type' => $goal->goal_type,
                    'count' => (int) $goal->aggregate,
                ])
                ->values()
                ->all(),
            'review_distribution' => (clone $reviewBase)
                ->selectRaw('status, COUNT(*) as aggregate')
                ->groupBy('status')
                ->orderBy('status')
                ->get()
                ->map(static fn (PerformanceReview $review): array => [
                    'status' => $review->status,
                    'count' => (int) $review->aggregate,
                ])
                ->values()
                ->all(),
            'cycle_snapshot' => $cycleSnapshot,
            'pending_reviews' => $pendingReviews,
            'recent_feedback' => $recentFeedback,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(User $actor): array
    {
        $employees = $this->accessibleEmployees($actor)->map(static fn (Employee $employee): array => [
            'id' => $employee->id,
            'employee_number' => $employee->employee_number,
            'full_name' => $employee->full_name,
            'job_title' => $employee->job_title,
            'department' => $employee->department?->name,
            'manager' => $employee->manager ? [
                'id' => $employee->manager->id,
                'employee_number' => $employee->manager->employee_number,
                'full_name' => $employee->manager->full_name,
            ] : null,
        ])->values();

        $cycles = $this->defaultCyclesCollection($actor)->map(static fn (PerformanceCycle $cycle): array => [
            'id' => $cycle->id,
            'code' => $cycle->code,
            'name' => $cycle->name,
            'status' => $cycle->status,
        ])->values();

        $activeCycle = $this->defaultCyclesCollection($actor)->firstWhere('status', 'active');

        return [
            'employees' => $employees,
            'cycles' => $cycles,
            'goal_types' => [
                ['value' => 'kpi', 'label' => 'KPI'],
                ['value' => 'okr', 'label' => 'OKR'],
                ['value' => 'goal', 'label' => 'Goal'],
            ],
            'goal_statuses' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'on_track', 'label' => 'On Track'],
                ['value' => 'at_risk', 'label' => 'At Risk'],
                ['value' => 'completed', 'label' => 'Completed'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
            ],
            'review_statuses' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'employee_submitted', 'label' => 'Employee Submitted'],
                ['value' => 'manager_submitted', 'label' => 'Manager Submitted'],
                ['value' => 'completed', 'label' => 'Completed'],
            ],
            'review_types' => [
                ['value' => 'quarterly', 'label' => 'Quarterly Review'],
                ['value' => 'mid_year', 'label' => 'Mid-year Review'],
                ['value' => 'annual', 'label' => 'Annual Review'],
                ['value' => 'probation', 'label' => 'Probation Review'],
                ['value' => 'project', 'label' => 'Project Review'],
            ],
            'feedback_types' => [
                ['value' => 'peer', 'label' => 'Peer Feedback'],
                ['value' => 'manager', 'label' => 'Manager Feedback'],
                ['value' => 'direct_report', 'label' => 'Direct Report Feedback'],
                ['value' => 'self', 'label' => 'Self Reflection'],
                ['value' => 'stakeholder', 'label' => 'Stakeholder Feedback'],
            ],
            'defaults' => [
                'cycle_id' => $activeCycle?->id,
                'review_type' => $activeCycle?->review_type ?? 'quarterly',
                'goal_type' => 'goal',
                'goal_status' => 'on_track',
                'review_status' => 'draft',
                'feedback_type' => 'peer',
                'due_date' => today()->addDays(45)->toDateString(),
                'current_date' => today()->toDateString(),
            ],
        ];
    }

    /**
     * @return Collection<int, PerformanceCycle>
     */
    public function cycles(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->cyclesQueryForActor($actor)
            ->with('creator')
            ->withCount([
                'goals',
                'reviews',
                'reviews as completed_reviews_count' => static fn (Builder $query) => $query->where('status', 'completed'),
            ])
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when(filled($query->filter('review_type')), static fn (Builder $builder) => $builder->where('review_type', (string) $query->filter('review_type')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByRaw("
                        CASE status
                            WHEN 'active' THEN 0
                            WHEN 'draft' THEN 1
                            WHEN 'closed' THEN 2
                            ELSE 3
                        END
                    ")
                    ->orderByDesc('period_start')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'name' => $builder->orderBy('name', $query->sortDirection),
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    default => $builder->orderBy('period_start', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PerformanceGoal>
     */
    public function goals(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->goalsQueryForActor($actor)
            ->with($this->goalRelations())
            ->when(filled($query->filter('cycle_id')), static fn (Builder $builder) => $builder->where('cycle_id', (int) $query->filter('cycle_id')))
            ->when(filled($query->filter('employee_id')), static fn (Builder $builder) => $builder->where('employee_id', (int) $query->filter('employee_id')))
            ->when(filled($query->filter('goal_type')), static fn (Builder $builder) => $builder->where('goal_type', (string) $query->filter('goal_type')))
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('employee', static fn (Builder $employeeQuery) => $employeeQuery
                            ->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByRaw("
                        CASE status
                            WHEN 'on_track' THEN 0
                            WHEN 'at_risk' THEN 1
                            WHEN 'completed' THEN 2
                            WHEN 'draft' THEN 3
                            ELSE 4
                        END
                    ")
                    ->orderByDesc('weight')
                    ->orderBy('due_date')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'progress_percent' => $builder->orderBy('progress_percent', $query->sortDirection),
                    'weight' => $builder->orderBy('weight', $query->sortDirection),
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    default => $builder->orderBy('due_date', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, PerformanceReview>
     */
    public function reviews(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return $this->reviewsQueryForActor($actor)
            ->with($this->reviewRelations())
            ->withCount('feedbacks')
            ->when(filled($query->filter('cycle_id')), static fn (Builder $builder) => $builder->where('cycle_id', (int) $query->filter('cycle_id')))
            ->when(filled($query->filter('employee_id')), static fn (Builder $builder) => $builder->where('employee_id', (int) $query->filter('employee_id')))
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->orWhereHas('employee', static fn (Builder $employeeQuery) => $employeeQuery
                            ->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%"))
                        ->orWhereHas('cycle', static fn (Builder $cycleQuery) => $cycleQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByRaw("
                        CASE status
                            WHEN 'draft' THEN 0
                            WHEN 'employee_submitted' THEN 1
                            WHEN 'manager_submitted' THEN 2
                            WHEN 'completed' THEN 3
                            ELSE 4
                        END
                    ")
                    ->orderByDesc('updated_at')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'overall_score' => $builder->orderBy('overall_score', $query->sortDirection),
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    default => $builder->orderBy('updated_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function showReview(User $actor, PerformanceReview $review): PerformanceReview
    {
        $this->assertCanViewEmployee($actor, $review->employee_id);

        return $review->loadMissing($this->reviewRelations())->loadCount('feedbacks');
    }

    public function createCycle(User $actor, array $data): PerformanceCycle
    {
        $this->assertCanManagePerformance($actor);

        return DB::transaction(function () use ($actor, $data): PerformanceCycle {
            $cycle = PerformanceCycle::query()->create([
                'code' => $data['code'] ?? $this->nextCycleCode(),
                'name' => $data['name'],
                'review_type' => $data['review_type'] ?? 'quarterly',
                'period_start' => $data['period_start'],
                'period_end' => $data['period_end'],
                'status' => $data['status'] ?? 'draft',
                'description' => $data['description'] ?? null,
                'created_by' => $actor->id,
                'meta' => $data['meta'] ?? null,
            ]);

            $cycle->load('creator');

            $this->auditLogs->record(
                actor: $actor,
                auditable: $cycle,
                action: 'performance.cycle.created',
                summary: "Performance cycle {$cycle->code} created by {$actor->name}.",
                newValues: $cycle->toArray(),
            );

            return $cycle;
        });
    }

    public function createGoal(User $actor, array $data): PerformanceGoal
    {
        $this->assertCanManagePerformance($actor);
        $this->assertCanViewEmployee($actor, (int) $data['employee_id']);

        return DB::transaction(function () use ($actor, $data): PerformanceGoal {
            $employee = Employee::query()->findOrFail((int) $data['employee_id']);
            $targetValue = $data['target_value'] ?? null;
            $currentValue = $data['current_value'] ?? null;
            $progress = $this->resolveProgressPercent($targetValue, $currentValue, $data['progress_percent'] ?? null);

            $goal = PerformanceGoal::query()->create([
                'cycle_id' => $data['cycle_id'],
                'employee_id' => $employee->id,
                'manager_id' => $data['manager_id'] ?? $employee->manager_id,
                'title' => $data['title'],
                'goal_type' => $data['goal_type'] ?? 'goal',
                'category' => $data['category'] ?? null,
                'description' => $data['description'] ?? null,
                'target_value' => $targetValue,
                'current_value' => $currentValue,
                'unit' => $data['unit'] ?? null,
                'weight' => $data['weight'] ?? 0,
                'progress_percent' => $progress,
                'status' => $this->resolveGoalStatus($data['status'] ?? null, $progress),
                'due_date' => $data['due_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'meta' => $data['meta'] ?? null,
            ]);

            $goal->load($this->goalRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $goal,
                action: 'performance.goal.created',
                summary: "Performance goal {$goal->title} created for {$employee->full_name}.",
                newValues: $goal->toArray(),
            );

            return $goal;
        });
    }

    public function updateGoal(PerformanceGoal $goal, User $actor, array $data): PerformanceGoal
    {
        if (! $this->canManagePerformance($actor) && ! $this->canOperateOnGoal($actor, $goal)) {
            throw new AuthorizationException('You are not allowed to update this performance goal.');
        }

        return DB::transaction(function () use ($goal, $actor, $data): PerformanceGoal {
            $oldValues = $goal->toArray();
            $payload = $this->canManagePerformance($actor)
                ? $data
                : collect($data)->only(['current_value', 'progress_percent', 'status', 'notes', 'meta'])->all();

            $targetValue = array_key_exists('target_value', $payload) ? $payload['target_value'] : $goal->target_value;
            $currentValue = array_key_exists('current_value', $payload) ? $payload['current_value'] : $goal->current_value;
            $progress = $this->resolveProgressPercent(
                $targetValue,
                $currentValue,
                $payload['progress_percent'] ?? $goal->progress_percent,
            );

            $goal->fill(array_filter([
                'title' => $payload['title'] ?? null,
                'goal_type' => $payload['goal_type'] ?? null,
                'category' => $payload['category'] ?? null,
                'description' => $payload['description'] ?? null,
                'target_value' => $targetValue,
                'current_value' => $currentValue,
                'unit' => $payload['unit'] ?? null,
                'weight' => $payload['weight'] ?? null,
                'due_date' => $payload['due_date'] ?? null,
                'notes' => array_key_exists('notes', $payload) ? $payload['notes'] : null,
                'meta' => $payload['meta'] ?? null,
            ], static fn (mixed $value): bool => $value !== null));

            $goal->forceFill([
                'progress_percent' => $progress,
                'status' => $this->resolveGoalStatus($payload['status'] ?? $goal->status, $progress),
            ])->save();

            $goal->refresh()->load($this->goalRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $goal,
                action: 'performance.goal.updated',
                summary: "Performance goal {$goal->title} updated by {$actor->name}.",
                oldValues: $oldValues,
                newValues: $goal->toArray(),
            );

            return $goal;
        });
    }

    public function createReview(User $actor, array $data): PerformanceReview
    {
        $this->assertCanManagePerformance($actor);
        $this->assertCanViewEmployee($actor, (int) $data['employee_id']);

        return DB::transaction(function () use ($actor, $data): PerformanceReview {
            $employee = Employee::query()->findOrFail((int) $data['employee_id']);

            if (PerformanceReview::query()
                ->where('cycle_id', $data['cycle_id'])
                ->where('employee_id', $employee->id)
                ->exists()) {
                throw ValidationException::withMessages([
                    'employee_id' => 'Performance review already exists for this employee in the selected cycle.',
                ]);
            }

            $review = PerformanceReview::query()->create([
                'cycle_id' => $data['cycle_id'],
                'employee_id' => $employee->id,
                'manager_id' => $data['manager_id'] ?? $employee->manager_id,
                'creator_id' => $actor->id,
                'status' => $data['status'] ?? 'draft',
                'meta' => $data['meta'] ?? null,
            ]);

            $review->load($this->reviewRelations())->loadCount('feedbacks');

            $this->auditLogs->record(
                actor: $actor,
                auditable: $review,
                action: 'performance.review.created',
                summary: "Performance review created for {$employee->full_name}.",
                newValues: $review->toArray(),
            );

            return $review;
        });
    }

    public function submitEmployeeReview(PerformanceReview $review, User $actor, array $data): PerformanceReview
    {
        if (! $this->canManagePerformance($actor) && ! $this->canSubmitEmployeeReview($actor, $review)) {
            throw new AuthorizationException('You are not allowed to submit this employee review.');
        }

        return DB::transaction(function () use ($review, $actor, $data): PerformanceReview {
            $oldValues = $review->toArray();

            $review->forceFill([
                'employee_review_summary' => $data['employee_review_summary'],
                'employee_review_highlights' => $data['employee_review_highlights'] ?? null,
                'employee_review_challenges' => $data['employee_review_challenges'] ?? null,
                'employee_rating' => $data['employee_rating'] ?? null,
                'employee_submitted_at' => now(),
                'meta' => array_merge($review->meta ?? [], $data['meta'] ?? []),
            ]);

            $this->refreshReviewOutcome($review);
            $review->save();
            $review->refresh()->load($this->reviewRelations())->loadCount('feedbacks');

            $this->auditLogs->record(
                actor: $actor,
                auditable: $review,
                action: 'performance.employee_review.submitted',
                summary: "Employee review submitted for {$review->employee?->full_name}.",
                oldValues: $oldValues,
                newValues: $review->toArray(),
            );

            return $review;
        });
    }

    public function submitManagerReview(PerformanceReview $review, User $actor, array $data): PerformanceReview
    {
        if (! $this->canManagePerformance($actor) && ! $this->canSubmitManagerReview($actor, $review)) {
            throw new AuthorizationException('You are not allowed to submit this manager review.');
        }

        return DB::transaction(function () use ($review, $actor, $data): PerformanceReview {
            $oldValues = $review->toArray();

            $review->forceFill([
                'manager_review_summary' => $data['manager_review_summary'],
                'manager_review_strengths' => $data['manager_review_strengths'] ?? null,
                'manager_review_improvements' => $data['manager_review_improvements'] ?? null,
                'manager_rating' => $data['manager_rating'] ?? null,
                'calibration_notes' => $data['calibration_notes'] ?? $review->calibration_notes,
                'manager_submitted_at' => now(),
                'meta' => array_merge($review->meta ?? [], $data['meta'] ?? []),
            ]);

            $this->refreshReviewOutcome(
                $review,
                $data['overall_score'] ?? null,
                $data['overall_rating'] ?? null,
            );

            $review->save();
            $review->refresh()->load($this->reviewRelations())->loadCount('feedbacks');

            $this->auditLogs->record(
                actor: $actor,
                auditable: $review,
                action: 'performance.manager_review.submitted',
                summary: "Manager review submitted for {$review->employee?->full_name}.",
                oldValues: $oldValues,
                newValues: $review->toArray(),
            );

            return $review;
        });
    }

    public function recordFeedback(PerformanceReview $review, User $actor, array $data): PerformanceFeedback
    {
        $this->assertCanViewEmployee($actor, $review->employee_id);

        if (! $this->canManagePerformance($actor) && ! $actor->hasPermissionTo('performance.review')) {
            throw new AuthorizationException('You are not allowed to record performance feedback.');
        }

        return DB::transaction(function () use ($review, $actor, $data): PerformanceFeedback {
            $feedback = PerformanceFeedback::query()->create([
                'review_id' => $review->id,
                'reviewer_id' => $data['reviewer_id'] ?? $actor->employee?->id,
                'reviewer_user_id' => $actor->id,
                'feedback_type' => $data['feedback_type'] ?? 'peer',
                'relationship' => $data['relationship'] ?? null,
                'strengths' => $data['strengths'] ?? null,
                'improvements' => $data['improvements'] ?? null,
                'comments' => $data['comments'] ?? null,
                'rating' => $data['rating'] ?? null,
                'is_anonymous' => (bool) ($data['is_anonymous'] ?? false),
                'submitted_at' => now(),
                'meta' => $data['meta'] ?? null,
            ]);

            $feedback->load($this->feedbackRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $feedback,
                action: 'performance.feedback.recorded',
                summary: "360 feedback recorded for {$review->employee?->full_name}.",
                newValues: $feedback->toArray(),
            );

            return $feedback;
        });
    }

    /**
     * @return list<string>
     */
    private function goalRelations(): array
    {
        return [
            'cycle',
            'employee.department',
            'manager.department',
        ];
    }

    /**
     * @return list<string>
     */
    private function reviewRelations(): array
    {
        return [
            'cycle',
            'employee.department',
            'manager.department',
            'creator',
            'feedbacks.reviewerEmployee.department',
            'feedbacks.reviewerUser',
        ];
    }

    /**
     * @return list<string>
     */
    private function feedbackRelations(): array
    {
        return [
            'review.employee.department',
            'review.cycle',
            'reviewerEmployee.department',
            'reviewerUser',
        ];
    }

    /**
     * @return Collection<int, PerformanceCycle>
     */
    private function defaultCyclesCollection(User $actor): Collection
    {
        return $this->cyclesQueryForActor($actor)
            ->with('creator')
            ->withCount([
                'goals',
                'reviews',
                'reviews as completed_reviews_count' => static fn (Builder $query) => $query->where('status', 'completed'),
            ])
            ->orderByRaw("
                CASE status
                    WHEN 'active' THEN 0
                    WHEN 'draft' THEN 1
                    WHEN 'closed' THEN 2
                    ELSE 3
                END
            ")
            ->orderByDesc('period_start')
            ->orderByDesc('id')
            ->get();
    }

    private function cyclesQueryForActor(User $actor): Builder
    {
        $query = PerformanceCycle::query();

        if ($this->canSeeAllPerformance($actor)) {
            return $query;
        }

        $employeeIds = $this->visibleEmployeeIds($actor);
        if ($employeeIds === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where(static function (Builder $builder) use ($employeeIds): void {
            $builder
                ->whereHas('goals', static fn (Builder $goalQuery) => $goalQuery->whereIn('employee_id', $employeeIds))
                ->orWhereHas('reviews', static fn (Builder $reviewQuery) => $reviewQuery->whereIn('employee_id', $employeeIds));
        });
    }

    private function goalsQueryForActor(User $actor): Builder
    {
        $query = PerformanceGoal::query();

        if ($this->canSeeAllPerformance($actor)) {
            return $query;
        }

        $employeeIds = $this->visibleEmployeeIds($actor);
        if ($employeeIds === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('employee_id', $employeeIds);
    }

    private function reviewsQueryForActor(User $actor): Builder
    {
        $query = PerformanceReview::query();

        if ($this->canSeeAllPerformance($actor)) {
            return $query;
        }

        $employeeIds = $this->visibleEmployeeIds($actor);
        if ($employeeIds === []) {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('employee_id', $employeeIds);
    }

    private function feedbackQueryForActor(User $actor): Builder
    {
        $query = PerformanceFeedback::query()->whereHas('review', function (Builder $reviewQuery) use ($actor): void {
            if ($this->canSeeAllPerformance($actor)) {
                return;
            }

            $employeeIds = $this->visibleEmployeeIds($actor);
            if ($employeeIds === []) {
                $reviewQuery->whereRaw('1 = 0');
                return;
            }

            $reviewQuery->whereIn('employee_id', $employeeIds);
        });

        return $query;
    }

    /**
     * @return Collection<int, Employee>
     */
    private function accessibleEmployees(User $actor): Collection
    {
        $query = Employee::query()
            ->with(['department', 'manager'])
            ->whereIn('employment_status', ['active', 'probation']);

        if ($this->canSeeAllPerformance($actor)) {
            return $query->orderBy('first_name')->orderBy('last_name')->get();
        }

        $employeeIds = $this->visibleEmployeeIds($actor);
        if ($employeeIds === []) {
            return collect();
        }

        return $query
            ->whereIn('id', $employeeIds)
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get();
    }

    /**
     * @return list<int>
     */
    private function visibleEmployeeIds(User $actor): array
    {
        $actor->loadMissing('employee');

        $actorEmployeeId = $actor->employee?->id;
        if (! $actorEmployeeId) {
            return [];
        }

        return Employee::query()
            ->where('id', $actorEmployeeId)
            ->orWhere('manager_id', $actorEmployeeId)
            ->pluck('id')
            ->map(static fn (mixed $id): int => (int) $id)
            ->values()
            ->all();
    }

    private function canSeeAllPerformance(User $actor): bool
    {
        return $actor->hasPermissionTo('performance.manage')
            || $actor->hasPermissionTo('audit.view');
    }

    private function canManagePerformance(User $actor): bool
    {
        return $actor->hasPermissionTo('performance.manage');
    }

    private function canOperateOnGoal(User $actor, PerformanceGoal $goal): bool
    {
        $actor->loadMissing('employee');
        $actorEmployeeId = $actor->employee?->id;

        return $actor->hasPermissionTo('performance.review')
            && $actorEmployeeId !== null
            && ($goal->employee_id === $actorEmployeeId || $goal->manager_id === $actorEmployeeId);
    }

    private function canSubmitEmployeeReview(User $actor, PerformanceReview $review): bool
    {
        $actor->loadMissing('employee');

        return $actor->hasPermissionTo('performance.review')
            && $actor->employee?->id === $review->employee_id;
    }

    private function canSubmitManagerReview(User $actor, PerformanceReview $review): bool
    {
        $actor->loadMissing('employee');

        return $actor->hasPermissionTo('performance.review')
            && $actor->employee?->id === $review->manager_id;
    }

    private function assertCanManagePerformance(User $actor): void
    {
        if (! $this->canManagePerformance($actor)) {
            throw new AuthorizationException('You are not allowed to manage performance data.');
        }
    }

    private function assertCanViewEmployee(User $actor, int $employeeId): void
    {
        if ($this->canSeeAllPerformance($actor)) {
            return;
        }

        if (! in_array($employeeId, $this->visibleEmployeeIds($actor), true)) {
            throw new AuthorizationException('You are not allowed to access this employee performance record.');
        }
    }

    private function resolveProgressPercent(
        int|float|string|null $targetValue,
        int|float|string|null $currentValue,
        int|float|string|null $progressPercent,
    ): float {
        if ($progressPercent !== null) {
            return round(min(100, max(0, (float) $progressPercent)), 2);
        }

        if ($targetValue !== null && (float) $targetValue > 0 && $currentValue !== null) {
            return round(min(100, max(0, ((float) $currentValue / (float) $targetValue) * 100)), 2);
        }

        return 0;
    }

    private function resolveGoalStatus(?string $status, float $progressPercent): string
    {
        if ($status === 'cancelled') {
            return 'cancelled';
        }

        if ($progressPercent >= 100) {
            return 'completed';
        }

        return $status ?? 'on_track';
    }

    private function refreshReviewOutcome(
        PerformanceReview $review,
        int|float|string|null $overallScoreOverride = null,
        ?string $overallRatingOverride = null,
    ): void {
        $status = 'draft';

        if ($review->employee_submitted_at !== null && $review->manager_submitted_at !== null) {
            $status = 'completed';
        } elseif ($review->manager_submitted_at !== null) {
            $status = 'manager_submitted';
        } elseif ($review->employee_submitted_at !== null) {
            $status = 'employee_submitted';
        }

        $calculatedScore = $overallScoreOverride !== null
            ? (float) $overallScoreOverride
            : $this->deriveOverallScore($review);

        $review->forceFill([
            'status' => $status,
            'overall_score' => $calculatedScore,
            'overall_rating' => $overallRatingOverride ?? ($calculatedScore !== null ? $this->deriveOverallRating($calculatedScore) : null),
            'completed_at' => $status === 'completed' ? now() : null,
        ]);
    }

    private function deriveOverallScore(PerformanceReview $review): ?float
    {
        $scores = collect([
            $review->manager_rating,
            $review->employee_rating,
        ])->filter(static fn (mixed $value): bool => $value !== null)->values();

        if ($scores->isEmpty()) {
            return null;
        }

        return round((float) ($scores->sum() / $scores->count()), 2);
    }

    private function deriveOverallRating(float $score): string
    {
        return match (true) {
            $score >= 4.5 => 'Outstanding',
            $score >= 3.75 => 'Exceeds Expectations',
            $score >= 3 => 'Meets Expectations',
            $score >= 2 => 'Needs Improvement',
            default => 'Unsatisfactory',
        };
    }

    private function nextCycleCode(): string
    {
        $year = today()->year;
        $quarter = (int) ceil(today()->month / 3);
        $baseCode = sprintf('PRF-%d-Q%d', $year, $quarter);

        if (! PerformanceCycle::query()->where('code', $baseCode)->exists()) {
            return $baseCode;
        }

        $suffix = 2;
        do {
            $candidate = sprintf('%s-%02d', $baseCode, $suffix);
            $suffix++;
        } while (PerformanceCycle::query()->where('code', $candidate)->exists());

        return $candidate;
    }
}
