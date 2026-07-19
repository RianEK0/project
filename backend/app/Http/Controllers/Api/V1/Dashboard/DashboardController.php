<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\Workforce\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Modules\Workforce\Application\Services\EmployeeService;
use Shared\Application\Support\ApiResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly EmployeeService $employeeService,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $summary = $this->employeeService->dashboardSummary();

        return ApiResponse::success([
            'metrics' => $summary['metrics'],
            'recent_hires' => EmployeeResource::collection($summary['recent_hires']),
        ]);
    }
}
