<?php

namespace App\Http\Controllers\Api\V1\Organization;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreTeamRequest;
use App\Http\Resources\Organization\TeamResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Organization\Application\DTO\TeamData;
use Modules\Organization\Application\Services\TeamService;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class TeamController extends Controller
{
    public function __construct(
        private readonly TeamService $teams,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Team::class);

        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['department_id', 'lead_employee_id'],
            allowedSorts: ['default', 'name', 'code', 'employees_count'],
            defaultSortBy: 'default',
        );
        $teams = $this->teams->paginate($query);

        return ApiResponse::paginated(
            $teams,
            TeamResource::collection($teams->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $this->authorize('create', Team::class);

        $team = $this->teams->create(
            TeamData::fromArray($request->validated()),
            $request->user('api'),
        );

        return ApiResponse::success(new TeamResource($team), 'Team created successfully.', 201);
    }
}
