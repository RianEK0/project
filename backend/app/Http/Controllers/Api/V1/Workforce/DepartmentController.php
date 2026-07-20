<?php

namespace App\Http\Controllers\Api\V1\Workforce;

use App\Http\Controllers\Controller;
use App\Http\Resources\Workforce\DepartmentResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Workforce\Domain\Contracts\DepartmentRepository;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class DepartmentController extends Controller
{
    public function __construct(
        private readonly DepartmentRepository $departments,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedSorts: ['default', 'name', 'code'],
            defaultSortBy: 'default',
        );
        $departments = $this->departments->paginate($query);

        return ApiResponse::paginated(
            $departments,
            DepartmentResource::collection($departments->items())->resolve(),
            meta: $query->meta(),
        );
    }
}
