<?php

namespace App\Http\Controllers\Api\V1\Workforce;

use App\Http\Controllers\Controller;
use App\Http\Resources\Workforce\DepartmentResource;
use Illuminate\Http\JsonResponse;
use Modules\Workforce\Domain\Contracts\DepartmentRepository;
use Shared\Application\Support\ApiResponse;

class DepartmentController extends Controller
{
    public function __construct(
        private readonly DepartmentRepository $departments,
    ) {
    }

    public function index(): JsonResponse
    {
        return ApiResponse::success(DepartmentResource::collection($this->departments->all()));
    }
}
