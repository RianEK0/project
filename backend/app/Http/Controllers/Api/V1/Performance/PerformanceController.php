<?php

namespace App\Http\Controllers\Api\V1\Performance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Performance\StorePerformanceCycleRequest;
use App\Http\Requests\Performance\StorePerformanceFeedbackRequest;
use App\Http\Requests\Performance\StorePerformanceGoalRequest;
use App\Http\Requests\Performance\StorePerformanceReviewRequest;
use App\Http\Requests\Performance\SubmitEmployeePerformanceReviewRequest;
use App\Http\Requests\Performance\SubmitManagerPerformanceReviewRequest;
use App\Http\Requests\Performance\UpdatePerformanceGoalRequest;
use App\Http\Resources\Performance\PerformanceCycleResource;
use App\Http\Resources\Performance\PerformanceFeedbackResource;
use App\Http\Resources\Performance\PerformanceGoalResource;
use App\Http\Resources\Performance\PerformanceReviewResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Performance\Application\Services\PerformanceService;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceGoal;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceReview;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class PerformanceController extends Controller
{
    public function __construct(
        private readonly PerformanceService $performance,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->performance->overview($request->user('api'));

        return ApiResponse::success([
            'current_date' => $overview['current_date'],
            'stats' => $overview['stats'],
            'goal_distribution' => $overview['goal_distribution'],
            'review_distribution' => $overview['review_distribution'],
            'cycle_snapshot' => PerformanceCycleResource::collection($overview['cycle_snapshot'])->resolve(),
            'pending_reviews' => PerformanceReviewResource::collection($overview['pending_reviews'])->resolve(),
            'recent_feedback' => PerformanceFeedbackResource::collection($overview['recent_feedback'])->resolve(),
        ]);
    }

    public function lookups(Request $request): JsonResponse
    {
        return ApiResponse::success($this->performance->lookups($request->user('api')));
    }

    public function cycles(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['status', 'review_type'],
            allowedSorts: ['default', 'period_start', 'name', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $cycles = $this->performance->cycles($request->user('api'), $query);

        return ApiResponse::paginated(
            $cycles,
            PerformanceCycleResource::collection($cycles->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function storeCycle(StorePerformanceCycleRequest $request): JsonResponse
    {
        $cycle = $this->performance->createCycle(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceCycleResource($cycle),
            'Performance cycle created successfully.',
            201,
        );
    }

    public function goals(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['cycle_id', 'employee_id', 'goal_type', 'status'],
            allowedSorts: ['default', 'due_date', 'progress_percent', 'weight', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $goals = $this->performance->goals($request->user('api'), $query);

        return ApiResponse::paginated(
            $goals,
            PerformanceGoalResource::collection($goals->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function storeGoal(StorePerformanceGoalRequest $request): JsonResponse
    {
        $goal = $this->performance->createGoal(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceGoalResource($goal),
            'Performance goal created successfully.',
            201,
        );
    }

    public function updateGoal(UpdatePerformanceGoalRequest $request, PerformanceGoal $goal): JsonResponse
    {
        $updatedGoal = $this->performance->updateGoal(
            $goal,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceGoalResource($updatedGoal),
            'Performance goal updated successfully.',
        );
    }

    public function reviews(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['cycle_id', 'employee_id', 'status'],
            allowedSorts: ['default', 'updated_at', 'overall_score', 'status'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $reviews = $this->performance->reviews($request->user('api'), $query);

        return ApiResponse::paginated(
            $reviews,
            PerformanceReviewResource::collection($reviews->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function showReview(Request $request, PerformanceReview $review): JsonResponse
    {
        return ApiResponse::success(
            new PerformanceReviewResource(
                $this->performance->showReview($request->user('api'), $review),
            ),
        );
    }

    public function storeReview(StorePerformanceReviewRequest $request): JsonResponse
    {
        $review = $this->performance->createReview(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceReviewResource($review),
            'Performance review created successfully.',
            201,
        );
    }

    public function submitEmployeeReview(SubmitEmployeePerformanceReviewRequest $request, PerformanceReview $review): JsonResponse
    {
        $updatedReview = $this->performance->submitEmployeeReview(
            $review,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceReviewResource($updatedReview),
            'Employee review submitted successfully.',
        );
    }

    public function submitManagerReview(SubmitManagerPerformanceReviewRequest $request, PerformanceReview $review): JsonResponse
    {
        $updatedReview = $this->performance->submitManagerReview(
            $review,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceReviewResource($updatedReview),
            'Manager review submitted successfully.',
        );
    }

    public function recordFeedback(StorePerformanceFeedbackRequest $request, PerformanceReview $review): JsonResponse
    {
        $feedback = $this->performance->recordFeedback(
            $review,
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success(
            new PerformanceFeedbackResource($feedback),
            'Performance feedback recorded successfully.',
            201,
        );
    }
}
