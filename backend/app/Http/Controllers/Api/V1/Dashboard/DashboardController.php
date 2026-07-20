<?php

namespace App\Http\Controllers\Api\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Resources\Governance\AuditLogResource;
use App\Http\Resources\Payroll\PayrollRunResource;
use App\Http\Resources\Recruitment\RecruitmentInterviewResource;
use App\Http\Resources\Recruitment\RecruitmentVacancyResource;
use App\Http\Resources\Workforce\EmployeeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\ExecutiveDashboardService;
use Shared\Application\Support\ApiResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ExecutiveDashboardService $dashboard,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $overview = $this->dashboard->overview($request->user('api'));

        return ApiResponse::success([
            'date' => $overview['date'],
            'metrics' => $overview['metrics'],
            'attendance' => $overview['attendance'],
            'leave' => $overview['leave'],
            'payroll' => [
                'display_month' => $overview['payroll']['display_month'],
                'stats' => $overview['payroll']['stats'],
                'latest_run' => $overview['payroll']['latest_run']
                    ? (new PayrollRunResource($overview['payroll']['latest_run']))->resolve()
                    : null,
            ],
            'recruitment' => [
                'stats' => $overview['recruitment']['stats'],
                'pipeline' => $overview['recruitment']['pipeline'],
                'upcoming_interviews' => RecruitmentInterviewResource::collection($overview['recruitment']['upcoming_interviews'])->resolve(),
                'vacancy_snapshot' => RecruitmentVacancyResource::collection($overview['recruitment']['vacancy_snapshot'])->resolve(),
            ],
            'departments' => $overview['departments'],
            'charts' => $overview['charts'],
            'statistics' => $overview['statistics'],
            'recent_hires' => EmployeeResource::collection($overview['recent_hires'])->resolve(),
            'activity_timeline' => AuditLogResource::collection($overview['activity_timeline'])->resolve(),
        ]);
    }
}
