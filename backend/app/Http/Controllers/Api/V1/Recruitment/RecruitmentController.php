<?php

namespace App\Http\Controllers\Api\V1\Recruitment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recruitment\HireRecruitmentCandidateRequest;
use App\Http\Requests\Recruitment\ScheduleRecruitmentInterviewRequest;
use App\Http\Requests\Recruitment\StoreRecruitmentAssessmentRequest;
use App\Http\Requests\Recruitment\StoreRecruitmentCandidateRequest;
use App\Http\Requests\Recruitment\StoreRecruitmentVacancyRequest;
use App\Http\Requests\Recruitment\UpdateRecruitmentApplicationRequest;
use App\Http\Requests\Recruitment\UpdateRecruitmentCandidateRequest;
use App\Http\Resources\Recruitment\RecruitmentApplicationResource;
use App\Http\Resources\Recruitment\RecruitmentAssessmentResource;
use App\Http\Resources\Recruitment\RecruitmentCandidateResource;
use App\Http\Resources\Recruitment\RecruitmentInterviewResource;
use App\Http\Resources\Recruitment\RecruitmentVacancyResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Recruitment\Application\Services\RecruitmentService;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentApplication;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentCandidate;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class RecruitmentController extends Controller
{
    public function __construct(
        private readonly RecruitmentService $recruitment,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->recruitment->overview($request->user('api'));

        return ApiResponse::success([
            'current_date' => $overview['current_date'],
            'stats' => $overview['stats'],
            'pipeline' => $overview['pipeline'],
            'upcoming_interviews' => RecruitmentInterviewResource::collection($overview['upcoming_interviews'])->resolve(),
            'recent_candidates' => RecruitmentCandidateResource::collection($overview['recent_candidates'])->resolve(),
            'vacancy_snapshot' => RecruitmentVacancyResource::collection($overview['vacancy_snapshot'])->resolve(),
        ]);
    }

    public function lookups(Request $request): JsonResponse
    {
        return ApiResponse::success($this->recruitment->lookups($request->user('api')));
    }

    public function vacancies(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['status', 'department_id', 'branch_id', 'employment_type', 'workplace_type'],
            allowedSorts: ['default', 'publish_date', 'title', 'close_date', 'openings_count'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $vacancies = $this->recruitment->vacancies($request->user('api'), $query);

        return ApiResponse::paginated(
            $vacancies,
            RecruitmentVacancyResource::collection($vacancies->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function storeVacancy(StoreRecruitmentVacancyRequest $request): JsonResponse
    {
        $vacancy = $this->recruitment->createVacancy(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new RecruitmentVacancyResource($vacancy),
            'Recruitment vacancy created successfully.',
            201,
        );
    }

    public function candidates(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['status', 'source', 'vacancy_id'],
            allowedSorts: ['default', 'full_name', 'experience_years', 'expected_salary', 'last_contacted_at'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $candidates = $this->recruitment->candidates($request->user('api'), $query);

        return ApiResponse::paginated(
            $candidates,
            RecruitmentCandidateResource::collection($candidates->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function storeCandidate(StoreRecruitmentCandidateRequest $request): JsonResponse
    {
        $candidate = $this->recruitment->createCandidate(
            $request->user('api'),
            $request->validated(),
            $request->file('cv'),
        );

        return ApiResponse::success(
            new RecruitmentCandidateResource($candidate),
            'Candidate created successfully.',
            201,
        );
    }

    public function updateCandidate(UpdateRecruitmentCandidateRequest $request, RecruitmentCandidate $candidate): JsonResponse
    {
        $updatedCandidate = $this->recruitment->updateCandidate(
            $candidate,
            $request->user('api'),
            $request->validated(),
            $request->file('cv'),
        );

        return ApiResponse::success(
            new RecruitmentCandidateResource($updatedCandidate),
            'Candidate updated successfully.',
        );
    }

    public function applications(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['vacancy_id', 'stage', 'status'],
            allowedSorts: ['default', 'applied_at', 'stage', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $applications = $this->recruitment->applications($request->user('api'), $query);

        return ApiResponse::paginated(
            $applications,
            RecruitmentApplicationResource::collection($applications->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function showApplication(Request $request, RecruitmentApplication $application): JsonResponse
    {
        return ApiResponse::success(
            new RecruitmentApplicationResource(
                $this->recruitment->showApplication($request->user('api'), $application),
            ),
        );
    }

    public function updateApplication(UpdateRecruitmentApplicationRequest $request, RecruitmentApplication $application): JsonResponse
    {
        $updatedApplication = $this->recruitment->updateApplication(
            $application,
            $request->user('api'),
            $request->validated(),
            $request->file('offer_letter'),
        );

        return ApiResponse::success(
            new RecruitmentApplicationResource($updatedApplication),
            'Recruitment application updated successfully.',
        );
    }

    public function interviewSchedule(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['start_date', 'end_date', 'interview_type'],
            allowedSorts: ['default', 'scheduled_at', 'title', 'interview_type'],
            defaultSortBy: 'default',
        );
        $interviews = $this->recruitment->interviewSchedule($request->user('api'), $query);

        return ApiResponse::paginated(
            $interviews,
            RecruitmentInterviewResource::collection($interviews->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function scheduleInterview(ScheduleRecruitmentInterviewRequest $request, RecruitmentApplication $application): JsonResponse
    {
        $interview = $this->recruitment->scheduleInterview(
            $application,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new RecruitmentInterviewResource($interview),
            'Interview scheduled successfully.',
            201,
        );
    }

    public function recordAssessment(StoreRecruitmentAssessmentRequest $request, RecruitmentApplication $application): JsonResponse
    {
        $assessment = $this->recruitment->recordAssessment(
            $application,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new RecruitmentAssessmentResource($assessment),
            'Assessment recorded successfully.',
            201,
        );
    }

    public function hire(HireRecruitmentCandidateRequest $request, RecruitmentApplication $application): JsonResponse
    {
        $hiredApplication = $this->recruitment->hireCandidate(
            $application,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new RecruitmentApplicationResource($hiredApplication),
            'Candidate hired successfully.',
        );
    }
}
