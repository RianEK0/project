<?php

namespace App\Http\Controllers\Api\V1\Organization;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreTeamRequest;
use App\Http\Resources\Organization\TeamResource;
use Illuminate\Http\JsonResponse;
use Modules\Organization\Application\DTO\TeamData;
use Modules\Organization\Application\Services\TeamService;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Shared\Application\Support\ApiResponse;

class TeamController extends Controller
{
    public function __construct(
        private readonly TeamService $teams,
    ) {
    }

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Team::class);

        return ApiResponse::success(TeamResource::collection($this->teams->list()));
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
