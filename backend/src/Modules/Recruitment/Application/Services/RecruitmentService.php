<?php

namespace Modules\Recruitment\Application\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentApplication;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentAssessment;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentCandidate;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentInterview;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentVacancy;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeContract;
use Modules\Workforce\Infrastructure\Persistence\Models\EmployeeSalaryHistory;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;
use Shared\Application\Support\ListQueryOptions;

class RecruitmentService
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
        $today = Carbon::today();
        $applications = RecruitmentApplication::query()->get();
        $upcomingInterviews = RecruitmentInterview::query()
            ->with(['application.candidate', 'application.vacancy.department'])
            ->where('scheduled_at', '>=', $today->copy()->startOfDay())
            ->orderBy('scheduled_at')
            ->limit(8)
            ->get();
        $recentCandidates = RecruitmentCandidate::query()
            ->with(['applications.vacancy'])
            ->latest('id')
            ->limit(5)
            ->get();
        $vacancySnapshot = RecruitmentVacancy::query()
            ->with(['department', 'branch'])
            ->withCount([
                'applications',
                'applications as active_applications_count' => static fn (Builder $query) => $query->whereIn('status', ['active', 'on_hold']),
                'applications as hired_applications_count' => static fn (Builder $query) => $query->where('stage', 'hired'),
            ])
            ->orderByRaw("CASE WHEN status = 'open' THEN 0 WHEN status = 'on_hold' THEN 1 WHEN status = 'filled' THEN 2 ELSE 3 END")
            ->orderByDesc('publish_date')
            ->orderByDesc('id')
            ->limit(5)
            ->get();

        $pipelineStages = collect(['applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected'])
            ->map(static function (string $stage) use ($applications): array {
                return [
                    'stage' => $stage,
                    'count' => $applications->where('stage', $stage)->count(),
                ];
            })
            ->all();

        $offersSent = $applications->filter(static fn (RecruitmentApplication $application): bool => $application->offer_sent_at !== null)->count();
        $hires = $applications->where('stage', 'hired')->count();

        return [
            'current_date' => $today->toDateString(),
            'stats' => [
                'open_vacancies' => RecruitmentVacancy::query()->where('status', 'open')->count(),
                'active_candidates' => RecruitmentCandidate::query()->where('status', 'active')->count(),
                'active_applications' => $applications->whereIn('status', ['active', 'on_hold'])->count(),
                'upcoming_interviews' => $upcomingInterviews->count(),
                'offers_sent' => $offersSent,
                'hires' => $hires,
                'offer_acceptance_rate' => $offersSent > 0 ? round(($applications->filter(static fn (RecruitmentApplication $application): bool => $application->offer_accepted_at !== null)->count() / $offersSent) * 100, 2) : 0,
            ],
            'pipeline' => $pipelineStages,
            'upcoming_interviews' => $upcomingInterviews,
            'recent_candidates' => $recentCandidates,
            'vacancy_snapshot' => $vacancySnapshot,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(User $actor): array
    {
        return [
            'departments' => Department::query()->orderBy('name')->get(['id', 'name', 'code']),
            'branches' => Branch::query()->orderBy('name')->get(['id', 'name', 'code']),
            'positions' => Position::query()->orderBy('name')->get(['id', 'name', 'code', 'grade', 'division_id', 'section_id']),
            'hiring_managers' => Employee::query()
                ->whereIn('employment_status', ['active', 'probation'])
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get(['id', 'employee_number', 'first_name', 'middle_name', 'last_name', 'job_title'])
                ->map(static fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'full_name' => $employee->full_name,
                    'job_title' => $employee->job_title,
                ])
                ->values(),
            'recruiters' => User::query()
                ->with('roles')
                ->whereHas('roles', static fn (Builder $query) => $query->whereIn('name', ['super-admin', 'hr-manager', 'recruitment-officer']))
                ->orderBy('name')
                ->get(['id', 'name', 'email'])
                ->map(static fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ])
                ->values(),
            'stages' => [
                ['value' => 'applied', 'label' => 'Applied'],
                ['value' => 'screening', 'label' => 'Screening'],
                ['value' => 'interview', 'label' => 'Interview'],
                ['value' => 'assessment', 'label' => 'Assessment'],
                ['value' => 'offer', 'label' => 'Offer'],
                ['value' => 'hired', 'label' => 'Hired'],
                ['value' => 'rejected', 'label' => 'Rejected'],
            ],
            'application_statuses' => [
                ['value' => 'active', 'label' => 'Active'],
                ['value' => 'on_hold', 'label' => 'On Hold'],
                ['value' => 'hired', 'label' => 'Hired'],
                ['value' => 'rejected', 'label' => 'Rejected'],
                ['value' => 'withdrawn', 'label' => 'Withdrawn'],
            ],
            'vacancy_statuses' => [
                ['value' => 'draft', 'label' => 'Draft'],
                ['value' => 'open', 'label' => 'Open'],
                ['value' => 'on_hold', 'label' => 'On Hold'],
                ['value' => 'closed', 'label' => 'Closed'],
                ['value' => 'filled', 'label' => 'Filled'],
            ],
            'employment_types' => [
                ['value' => 'permanent', 'label' => 'Permanent'],
                ['value' => 'contract', 'label' => 'Contract'],
                ['value' => 'probation', 'label' => 'Probation'],
                ['value' => 'internship', 'label' => 'Internship'],
            ],
            'workplace_types' => [
                ['value' => 'onsite', 'label' => 'On-site'],
                ['value' => 'hybrid', 'label' => 'Hybrid'],
                ['value' => 'remote', 'label' => 'Remote'],
            ],
            'interview_types' => [
                ['value' => 'screening', 'label' => 'Screening'],
                ['value' => 'hr', 'label' => 'HR Interview'],
                ['value' => 'technical', 'label' => 'Technical Interview'],
                ['value' => 'panel', 'label' => 'Panel Interview'],
                ['value' => 'final', 'label' => 'Final Interview'],
                ['value' => 'culture-fit', 'label' => 'Culture Fit'],
            ],
            'assessment_types' => [
                ['value' => 'technical', 'label' => 'Technical Test'],
                ['value' => 'psychometric', 'label' => 'Psychometric'],
                ['value' => 'case-study', 'label' => 'Case Study'],
                ['value' => 'assignment', 'label' => 'Assignment'],
                ['value' => 'behavioral', 'label' => 'Behavioral'],
            ],
            'defaults' => [
                'status' => 'open',
                'stage' => 'applied',
                'candidate_status' => 'active',
                'currency' => 'IDR',
                'publish_date' => Carbon::today()->toDateString(),
                'hire_date' => Carbon::today()->toDateString(),
            ],
        ];
    }

    /**
     * @return Collection<int, RecruitmentVacancy>
     */
    public function vacancies(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return RecruitmentVacancy::query()
            ->with(['department', 'branch', 'position', 'recruiter', 'hiringManager.department'])
            ->withCount([
                'applications',
                'applications as active_applications_count' => static fn (Builder $query) => $query->whereIn('status', ['active', 'on_hold']),
                'applications as hired_applications_count' => static fn (Builder $query) => $query->where('stage', 'hired'),
            ])
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when(filled($query->filter('department_id')), static fn (Builder $builder) => $builder->where('department_id', (int) $query->filter('department_id')))
            ->when(filled($query->filter('branch_id')), static fn (Builder $builder) => $builder->where('branch_id', (int) $query->filter('branch_id')))
            ->when(filled($query->filter('employment_type')), static fn (Builder $builder) => $builder->where('employment_type', (string) $query->filter('employment_type')))
            ->when(filled($query->filter('workplace_type')), static fn (Builder $builder) => $builder->where('workplace_type', (string) $query->filter('workplace_type')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhereHas('department', static fn (Builder $departmentQuery) => $departmentQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('position', static fn (Builder $positionQuery) => $positionQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByRaw("CASE WHEN status = 'open' THEN 0 WHEN status = 'on_hold' THEN 1 WHEN status = 'filled' THEN 2 ELSE 3 END")
                    ->orderByDesc('publish_date')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'title' => $builder->orderBy('title', $query->sortDirection),
                    'close_date' => $builder->orderBy('close_date', $query->sortDirection),
                    'openings_count' => $builder->orderBy('openings_count', $query->sortDirection),
                    default => $builder->orderBy('publish_date', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return Collection<int, RecruitmentCandidate>
     */
    public function candidates(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return RecruitmentCandidate::query()
            ->with(['applications.vacancy.department', 'applications.hiredEmployee.department'])
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when(filled($query->filter('source')), static fn (Builder $builder) => $builder->where('source', (string) $query->filter('source')))
            ->when(filled($query->filter('vacancy_id')), static fn (Builder $builder) => $builder->whereHas('applications', static fn (Builder $applicationQuery) => $applicationQuery->where('vacancy_id', (int) $query->filter('vacancy_id'))))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('full_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('current_company', 'like', "%{$search}%")
                        ->orWhere('current_position', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder->orderByDesc('created_at')->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'full_name' => $builder->orderBy('full_name', $query->sortDirection),
                    'experience_years' => $builder->orderBy('experience_years', $query->sortDirection),
                    'expected_salary' => $builder->orderBy('expected_salary', $query->sortDirection),
                    default => $builder->orderBy('last_contacted_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, RecruitmentApplication>
     */
    public function applications(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return RecruitmentApplication::query()
            ->with($this->applicationRelations())
            ->when(filled($query->filter('vacancy_id')), static fn (Builder $builder) => $builder->where('vacancy_id', (int) $query->filter('vacancy_id')))
            ->when(filled($query->filter('stage')), static fn (Builder $builder) => $builder->where('stage', (string) $query->filter('stage')))
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->whereHas('candidate', static fn (Builder $candidateQuery) => $candidateQuery
                            ->where('full_name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('vacancy', static fn (Builder $vacancyQuery) => $vacancyQuery
                            ->where('title', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByRaw("
                        CASE stage
                            WHEN 'applied' THEN 0
                            WHEN 'screening' THEN 1
                            WHEN 'interview' THEN 2
                            WHEN 'assessment' THEN 3
                            WHEN 'offer' THEN 4
                            WHEN 'hired' THEN 5
                            WHEN 'rejected' THEN 6
                            ELSE 7
                        END
                    ")
                    ->orderByDesc('applied_at')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'stage' => $builder->orderBy('stage', $query->sortDirection),
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    default => $builder->orderBy('applied_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function showApplication(User $actor, RecruitmentApplication $application): RecruitmentApplication
    {
        return $application->loadMissing($this->applicationRelations());
    }

    /**
     * @return Collection<int, RecruitmentInterview>
     */
    public function interviewSchedule(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        return RecruitmentInterview::query()
            ->with(['application.candidate', 'application.vacancy.department', 'interviewer'])
            ->when(filled($query->filter('start_date')), static fn (Builder $builder) => $builder->whereDate('scheduled_at', '>=', (string) $query->filter('start_date')))
            ->when(filled($query->filter('end_date')), static fn (Builder $builder) => $builder->whereDate('scheduled_at', '<=', (string) $query->filter('end_date')))
            ->when(filled($query->filter('interview_type')), static fn (Builder $builder) => $builder->where('interview_type', (string) $query->filter('interview_type')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('location', 'like', "%{$search}%")
                        ->orWhereHas('application.candidate', static fn (Builder $candidateQuery) => $candidateQuery->where('full_name', 'like', "%{$search}%"))
                        ->orWhereHas('application.vacancy', static fn (Builder $vacancyQuery) => $vacancyQuery->where('title', 'like', "%{$search}%"));
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder->orderBy('scheduled_at')->orderBy('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'title' => $builder->orderBy('title', $query->sortDirection),
                    'interview_type' => $builder->orderBy('interview_type', $query->sortDirection),
                    default => $builder->orderBy('scheduled_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function createVacancy(User $actor, array $data): RecruitmentVacancy
    {
        return DB::transaction(function () use ($actor, $data): RecruitmentVacancy {
            $vacancy = RecruitmentVacancy::query()->create([
                'code' => $data['code'] ?? $this->nextVacancyCode(),
                'title' => $data['title'],
                'employment_type' => $data['employment_type'],
                'workplace_type' => $data['workplace_type'] ?? 'onsite',
                'status' => $data['status'] ?? 'open',
                'department_id' => $data['department_id'] ?? null,
                'branch_id' => $data['branch_id'] ?? null,
                'position_id' => $data['position_id'] ?? null,
                'recruiter_id' => $data['recruiter_id'] ?? $actor->id,
                'hiring_manager_id' => $data['hiring_manager_id'] ?? null,
                'openings_count' => $data['openings_count'] ?? 1,
                'min_experience_years' => $data['min_experience_years'] ?? 0,
                'salary_min' => $data['salary_min'] ?? null,
                'salary_max' => $data['salary_max'] ?? null,
                'currency' => $data['currency'] ?? 'IDR',
                'publish_date' => $data['publish_date'] ?? Carbon::today()->toDateString(),
                'close_date' => $data['close_date'] ?? null,
                'description' => $data['description'] ?? null,
                'requirements' => $data['requirements'] ?? null,
                'notes' => $data['notes'] ?? null,
                'meta' => $data['meta'] ?? null,
            ]);

            $vacancy->load(['department', 'branch', 'position', 'recruiter', 'hiringManager.department']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $vacancy,
                action: 'recruitment.vacancy.created',
                summary: "Vacancy {$vacancy->code} created by {$actor->name}.",
                newValues: $vacancy->toArray(),
            );

            return $vacancy;
        });
    }

    public function createCandidate(User $actor, array $data, ?UploadedFile $cv = null): RecruitmentCandidate
    {
        return DB::transaction(function () use ($actor, $data, $cv): RecruitmentCandidate {
            $candidatePayload = [
                'candidate_code' => $data['candidate_code'] ?? $this->nextCandidateCode(),
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'source' => $data['source'] ?? null,
                'location' => $data['location'] ?? null,
                'current_company' => $data['current_company'] ?? null,
                'current_position' => $data['current_position'] ?? null,
                'experience_years' => $data['experience_years'] ?? 0,
                'expected_salary' => $data['expected_salary'] ?? null,
                'currency' => $data['currency'] ?? 'IDR',
                'summary' => $data['summary'] ?? null,
                'linkedin_url' => $data['linkedin_url'] ?? null,
                'portfolio_url' => $data['portfolio_url'] ?? null,
                'status' => $data['status'] ?? 'active',
                'last_contacted_at' => isset($data['last_contacted_at']) ? Carbon::parse($data['last_contacted_at']) : null,
                'meta' => $data['meta'] ?? null,
            ];

            if ($cv) {
                $candidatePayload = array_merge($candidatePayload, $this->storeCandidateCv($cv, null));
            }

            $candidate = RecruitmentCandidate::query()->create($candidatePayload);

            if (! empty($data['vacancy_id'])) {
                $vacancy = RecruitmentVacancy::query()->findOrFail((int) $data['vacancy_id']);
                $this->createApplicationForCandidate($candidate, $vacancy, $actor, $data);
            }

            $candidate->load(['applications.vacancy.department', 'applications.hiredEmployee.department']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $candidate,
                action: 'recruitment.candidate.created',
                summary: "Candidate {$candidate->full_name} added by {$actor->name}.",
                newValues: $candidate->toArray(),
            );

            return $candidate;
        });
    }

    public function updateCandidate(RecruitmentCandidate $candidate, User $actor, array $data, ?UploadedFile $cv = null): RecruitmentCandidate
    {
        return DB::transaction(function () use ($candidate, $actor, $data, $cv): RecruitmentCandidate {
            $before = $candidate->toArray();

            $payload = [
                'candidate_code' => $data['candidate_code'] ?? $candidate->candidate_code,
                'full_name' => $data['full_name'] ?? $candidate->full_name,
                'email' => $data['email'] ?? $candidate->email,
                'phone' => $data['phone'] ?? $candidate->phone,
                'source' => $data['source'] ?? $candidate->source,
                'location' => $data['location'] ?? $candidate->location,
                'current_company' => $data['current_company'] ?? $candidate->current_company,
                'current_position' => $data['current_position'] ?? $candidate->current_position,
                'experience_years' => $data['experience_years'] ?? $candidate->experience_years,
                'expected_salary' => $data['expected_salary'] ?? $candidate->expected_salary,
                'currency' => $data['currency'] ?? $candidate->currency,
                'summary' => $data['summary'] ?? $candidate->summary,
                'linkedin_url' => $data['linkedin_url'] ?? $candidate->linkedin_url,
                'portfolio_url' => $data['portfolio_url'] ?? $candidate->portfolio_url,
                'status' => $data['status'] ?? $candidate->status,
                'last_contacted_at' => array_key_exists('last_contacted_at', $data)
                    ? ($data['last_contacted_at'] ? Carbon::parse($data['last_contacted_at']) : null)
                    : $candidate->last_contacted_at,
                'meta' => array_key_exists('meta', $data) ? $data['meta'] : $candidate->meta,
            ];

            if ($cv) {
                $payload = array_merge($payload, $this->storeCandidateCv($cv, $candidate));
            }

            $candidate->fill($payload)->save();

            if (! empty($data['vacancy_id'])) {
                $vacancy = RecruitmentVacancy::query()->findOrFail((int) $data['vacancy_id']);

                if (! $candidate->applications()->where('vacancy_id', $vacancy->id)->exists()) {
                    $this->createApplicationForCandidate($candidate, $vacancy, $actor, $data);
                }
            }

            $candidate->load(['applications.vacancy.department', 'applications.hiredEmployee.department']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $candidate,
                action: 'recruitment.candidate.updated',
                summary: "Candidate {$candidate->full_name} updated by {$actor->name}.",
                oldValues: $before,
                newValues: $candidate->toArray(),
            );

            return $candidate;
        });
    }

    public function updateApplication(RecruitmentApplication $application, User $actor, array $data, ?UploadedFile $offerLetter = null): RecruitmentApplication
    {
        return DB::transaction(function () use ($application, $actor, $data, $offerLetter): RecruitmentApplication {
            $before = $application->toArray();

            if (($data['stage'] ?? null) === 'hired') {
                throw ValidationException::withMessages([
                    'stage' => 'Use the hiring action to complete a hire and create the employee record.',
                ]);
            }

            $payload = [
                'stage' => $data['stage'] ?? $application->stage,
                'status' => $data['status'] ?? $application->status,
                'rating' => array_key_exists('rating', $data) ? $data['rating'] : $application->rating,
                'recruiter_id' => $data['recruiter_id'] ?? $application->recruiter_id,
                'offer_sent_at' => array_key_exists('offer_sent_at', $data)
                    ? ($data['offer_sent_at'] ? Carbon::parse($data['offer_sent_at']) : null)
                    : $application->offer_sent_at,
                'offer_accepted_at' => array_key_exists('offer_accepted_at', $data)
                    ? ($data['offer_accepted_at'] ? Carbon::parse($data['offer_accepted_at']) : null)
                    : $application->offer_accepted_at,
                'rejection_reason' => $data['rejection_reason'] ?? $application->rejection_reason,
                'notes' => $data['notes'] ?? $application->notes,
                'meta' => array_key_exists('meta', $data) ? $data['meta'] : $application->meta,
            ];

            if (($payload['stage'] ?? $application->stage) === 'offer' && ! $payload['offer_sent_at']) {
                $payload['offer_sent_at'] = now();
            }

            if (($payload['stage'] ?? $application->stage) === 'rejected') {
                $payload['status'] = 'rejected';
            }

            if ($offerLetter) {
                $payload = array_merge($payload, $this->storeOfferLetter($offerLetter, $application));
            }

            $application->fill($payload)->save();

            if ($application->stage === 'rejected' && ! $application->candidate->applications()->whereIn('status', ['active', 'on_hold'])->whereKeyNot($application->id)->exists()) {
                $application->candidate->forceFill([
                    'status' => 'rejected',
                ])->save();
            }

            $application->load($this->applicationRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $application,
                action: 'recruitment.application.updated',
                summary: "Application {$application->id} updated by {$actor->name}.",
                oldValues: $before,
                newValues: $application->toArray(),
            );

            return $application;
        });
    }

    public function scheduleInterview(RecruitmentApplication $application, User $actor, array $data): RecruitmentInterview
    {
        return DB::transaction(function () use ($application, $actor, $data): RecruitmentInterview {
            $interview = $application->interviews()->create([
                'title' => $data['title'],
                'interview_type' => $data['interview_type'],
                'stage' => $data['stage'] ?? 'interview',
                'scheduled_at' => Carbon::parse($data['scheduled_at']),
                'duration_minutes' => $data['duration_minutes'] ?? 60,
                'location' => $data['location'] ?? null,
                'interviewer_id' => $data['interviewer_id'] ?? null,
                'status' => $data['status'] ?? 'scheduled',
                'score' => $data['score'] ?? null,
                'feedback' => $data['feedback'] ?? null,
                'notes' => $data['notes'] ?? null,
                'meta' => $data['meta'] ?? null,
            ]);

            if (! in_array($application->stage, ['offer', 'hired', 'rejected'], true)) {
                $application->forceFill([
                    'stage' => 'interview',
                    'status' => 'active',
                ])->save();
            }

            $interview->load(['application.candidate', 'application.vacancy.department', 'interviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $interview,
                action: 'recruitment.interview.scheduled',
                summary: "Interview scheduled for {$application->candidate->full_name} by {$actor->name}.",
                newValues: $interview->toArray(),
            );

            return $interview;
        });
    }

    public function recordAssessment(RecruitmentApplication $application, User $actor, array $data): RecruitmentAssessment
    {
        return DB::transaction(function () use ($application, $actor, $data): RecruitmentAssessment {
            $assessment = $application->assessments()->create([
                'title' => $data['title'],
                'assessment_type' => $data['assessment_type'],
                'assigned_at' => isset($data['assigned_at']) ? Carbon::parse($data['assigned_at']) : null,
                'due_at' => isset($data['due_at']) ? Carbon::parse($data['due_at']) : null,
                'completed_at' => isset($data['completed_at']) ? Carbon::parse($data['completed_at']) : null,
                'status' => $data['status'],
                'score' => $data['score'] ?? null,
                'max_score' => $data['max_score'] ?? null,
                'result' => $data['result'] ?? null,
                'notes' => $data['notes'] ?? null,
                'reviewer_id' => $data['reviewer_id'] ?? $actor->id,
                'meta' => $data['meta'] ?? null,
            ]);

            if (! in_array($application->stage, ['offer', 'hired', 'rejected'], true)) {
                $application->forceFill([
                    'stage' => 'assessment',
                    'status' => 'active',
                ])->save();
            }

            $assessment->load(['application.candidate', 'application.vacancy.department', 'reviewer']);

            $this->auditLogs->record(
                actor: $actor,
                auditable: $assessment,
                action: 'recruitment.assessment.recorded',
                summary: "Assessment recorded for {$application->candidate->full_name} by {$actor->name}.",
                newValues: $assessment->toArray(),
            );

            return $assessment;
        });
    }

    public function hireCandidate(RecruitmentApplication $application, User $actor, array $data): RecruitmentApplication
    {
        return DB::transaction(function () use ($application, $actor, $data): RecruitmentApplication {
            $application->loadMissing(['candidate', 'vacancy.position', 'vacancy.department', 'vacancy.branch']);

            if ($application->stage === 'hired' || $application->hired_employee_id) {
                throw ValidationException::withMessages([
                    'application' => 'This candidate has already been hired for the selected application.',
                ]);
            }

            $employee = $this->createEmployeeFromApplication($application, $data);

            $application->forceFill([
                'stage' => 'hired',
                'status' => 'hired',
                'hired_employee_id' => $employee->id,
                'offer_accepted_at' => $application->offer_accepted_at ?? now(),
                'offer_sent_at' => $application->offer_sent_at ?? now(),
                'notes' => trim(implode("\n\n", array_filter([
                    $application->notes,
                    $data['notes'] ?? null,
                ]))),
                'meta' => array_merge($application->meta ?? [], [
                    'hired_employee_number' => $employee->employee_number,
                    'hired_employee_name' => $employee->full_name,
                ]),
            ])->save();

            $application->candidate->forceFill([
                'status' => 'hired',
                'hired_at' => now(),
                'last_contacted_at' => now(),
            ])->save();

            $hiredCount = $application->vacancy->applications()->where('stage', 'hired')->count();
            $vacancyStatus = $hiredCount >= $application->vacancy->openings_count ? 'filled' : 'open';

            $application->vacancy->forceFill([
                'status' => $vacancyStatus,
            ])->save();

            $application->refresh()->load($this->applicationRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $application,
                action: 'recruitment.candidate.hired',
                summary: "{$application->candidate->full_name} hired by {$actor->name} as {$employee->job_title}.",
                newValues: [
                    'application_id' => $application->id,
                    'employee_id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'hire_date' => $employee->hire_date?->toDateString(),
                ],
            );

            return $application;
        });
    }

    /**
     * @return list<string>
     */
    private function applicationRelations(): array
    {
        return [
            'candidate',
            'vacancy.department',
            'vacancy.branch',
            'vacancy.position',
            'vacancy.recruiter',
            'vacancy.hiringManager.department',
            'recruiter',
            'hiredEmployee.department',
            'interviews.interviewer',
            'assessments.reviewer',
        ];
    }

    private function createApplicationForCandidate(RecruitmentCandidate $candidate, RecruitmentVacancy $vacancy, User $actor, array $data): RecruitmentApplication
    {
        return RecruitmentApplication::query()->create([
            'vacancy_id' => $vacancy->id,
            'candidate_id' => $candidate->id,
            'recruiter_id' => $vacancy->recruiter_id ?? $actor->id,
            'applied_at' => now(),
            'stage' => 'applied',
            'status' => 'active',
            'notes' => $data['application_notes'] ?? $data['notes'] ?? null,
            'meta' => [
                'source' => $candidate->source,
                'vacancy_code' => $vacancy->code,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function storeCandidateCv(UploadedFile $file, ?RecruitmentCandidate $candidate): array
    {
        if ($candidate?->cv_disk && $candidate->cv_path) {
            Storage::disk($candidate->cv_disk)->delete($candidate->cv_path);
        }

        $directory = $candidate ? "recruitment/candidates/{$candidate->id}" : 'recruitment/candidates/pending';
        $path = $file->store($directory, 'public');

        return [
            'cv_disk' => 'public',
            'cv_path' => $path,
            'cv_file_name' => $file->getClientOriginalName(),
            'cv_mime_type' => $file->getMimeType(),
            'cv_file_size' => $file->getSize(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function storeOfferLetter(UploadedFile $file, RecruitmentApplication $application): array
    {
        if ($application->offer_letter_disk && $application->offer_letter_path) {
            Storage::disk($application->offer_letter_disk)->delete($application->offer_letter_path);
        }

        $path = $file->store("recruitment/applications/{$application->id}/offers", 'public');

        return [
            'offer_letter_disk' => 'public',
            'offer_letter_path' => $path,
            'offer_letter_file_name' => $file->getClientOriginalName(),
            'offer_letter_mime_type' => $file->getMimeType(),
            'offer_letter_file_size' => $file->getSize(),
        ];
    }

    private function createEmployeeFromApplication(RecruitmentApplication $application, array $data): Employee
    {
        $candidate = $application->candidate;
        $vacancy = $application->vacancy;

        $departmentId = $data['department_id'] ?? $vacancy->department_id;
        if (! $departmentId) {
            throw ValidationException::withMessages([
                'department_id' => 'Department is required to hire a candidate into the workforce.',
            ]);
        }

        $positionId = $data['position_id'] ?? $vacancy->position_id;
        $position = $positionId ? Position::query()->find($positionId) : null;

        $employee = Employee::query()->create([
            'employee_number' => $this->nextEmployeeNumber(),
            'first_name' => $this->splitFullName($candidate->full_name)['first_name'],
            'middle_name' => null,
            'last_name' => $this->splitFullName($candidate->full_name)['last_name'],
            'preferred_name' => null,
            'work_email' => $data['work_email'] ?? $this->generateWorkEmail($candidate->full_name),
            'personal_email' => $candidate->email,
            'phone' => $candidate->phone,
            'job_title' => $data['job_title'] ?? $vacancy->title ?? $position?->name ?? $candidate->current_position ?? 'New Hire',
            'employment_type' => $data['employment_type'],
            'employment_status' => 'active',
            'department_id' => $departmentId,
            'branch_id' => $data['branch_id'] ?? $vacancy->branch_id,
            'division_id' => $position?->division_id,
            'section_id' => $position?->section_id,
            'position_id' => $position?->id,
            'manager_id' => $data['manager_id'] ?? $vacancy->hiring_manager_id,
            'hire_date' => $data['hire_date'],
            'meta' => array_merge($data['meta'] ?? [], [
                'recruitment_application_id' => $application->id,
                'recruitment_candidate_id' => $candidate->id,
                'recruitment_vacancy_id' => $vacancy->id,
                'current_company' => $candidate->current_company,
                'source' => $candidate->source,
            ]),
        ]);

        if (! empty($data['base_salary'])) {
            EmployeeSalaryHistory::query()->create([
                'employee_id' => $employee->id,
                'component' => 'Base Salary',
                'amount' => $data['base_salary'],
                'currency' => $data['salary_currency'] ?? 'IDR',
                'pay_frequency' => 'monthly',
                'effective_date' => $data['hire_date'],
                'is_current' => true,
            ]);
        }

        if ((bool) ($data['create_contract'] ?? true)) {
            EmployeeContract::query()->create([
                'employee_id' => $employee->id,
                'contract_type' => $data['employment_type'],
                'contract_number' => $data['contract_number'] ?? sprintf('CTR-%s', $employee->employee_number),
                'start_date' => $data['hire_date'],
                'end_date' => $data['contract_end_date'] ?? null,
                'status' => 'active',
                'notes' => $data['notes'] ?? 'Generated from recruitment hiring workflow.',
            ]);
        }

        return $employee->refresh();
    }

    /**
     * @return array{first_name: string, last_name: string}
     */
    private function splitFullName(string $fullName): array
    {
        $tokens = array_values(array_filter(preg_split('/\s+/', trim($fullName)) ?: []));
        $firstName = $tokens[0] ?? $fullName;
        $lastName = count($tokens) > 1 ? implode(' ', array_slice($tokens, 1)) : '-';

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
        ];
    }

    private function nextVacancyCode(): string
    {
        $max = RecruitmentVacancy::query()
            ->pluck('code')
            ->map(static fn (string $code): int => preg_match('/(\d+)$/', $code, $matches) === 1 ? (int) $matches[1] : 0)
            ->max() ?? 0;

        return sprintf('VAC-%04d', $max + 1);
    }

    private function nextCandidateCode(): string
    {
        $max = RecruitmentCandidate::query()
            ->pluck('candidate_code')
            ->map(static fn (string $code): int => preg_match('/(\d+)$/', $code, $matches) === 1 ? (int) $matches[1] : 0)
            ->max() ?? 0;

        return sprintf('CAN-%04d', $max + 1);
    }

    private function nextEmployeeNumber(): string
    {
        $max = Employee::query()
            ->pluck('employee_number')
            ->map(static fn (string $employeeNumber): int => preg_match('/(\d+)$/', $employeeNumber, $matches) === 1 ? (int) $matches[1] : 0)
            ->max() ?? 0;

        return sprintf('EMP-%04d', $max + 1);
    }

    private function generateWorkEmail(string $fullName): string
    {
        $base = Str::slug($fullName, '.');
        $base = $base !== '' ? $base : 'new.hire';
        $domain = 'enterprise-hris.local';
        $email = "{$base}@{$domain}";
        $suffix = 1;

        while (Employee::query()->where('work_email', $email)->exists()) {
            $suffix++;
            $email = sprintf('%s.%d@%s', $base, $suffix, $domain);
        }

        return $email;
    }
}
