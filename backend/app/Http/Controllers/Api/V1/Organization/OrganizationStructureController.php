<?php

namespace App\Http\Controllers\Api\V1\Organization;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationUnitRequest;
use Illuminate\Http\JsonResponse;
use Modules\Organization\Application\Services\OrganizationStructureService;
use Shared\Application\Support\ApiResponse;

class OrganizationStructureController extends Controller
{
    public function __construct(
        private readonly OrganizationStructureService $organization,
    ) {
    }

    public function index(): JsonResponse
    {
        return ApiResponse::success($this->organization->overview());
    }

    public function lookups(): JsonResponse
    {
        return ApiResponse::success($this->organization->lookups());
    }

    public function storeUnit(StoreOrganizationUnitRequest $request): JsonResponse
    {
        abort_unless($request->user('api')?->hasPermissionTo('teams.manage'), 403);

        return ApiResponse::success(
            $this->organization->createUnit($request->validated(), $request->user('api')),
            'Organization unit created successfully.',
            201,
        );
    }
}
