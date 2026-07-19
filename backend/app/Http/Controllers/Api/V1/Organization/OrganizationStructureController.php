<?php

namespace App\Http\Controllers\Api\V1\Organization;

use App\Http\Controllers\Controller;
use App\Http\Resources\Organization\OrganizationStructureResource;
use Illuminate\Http\JsonResponse;
use Modules\Organization\Application\Services\TeamService;
use Shared\Application\Support\ApiResponse;

class OrganizationStructureController extends Controller
{
    public function __construct(
        private readonly TeamService $teams,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        return ApiResponse::success(
            OrganizationStructureResource::collection($this->teams->structure())
        );
    }
}
