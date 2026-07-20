<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Modules\Attendance\Application\Services\AttendanceService;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceRecord;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Modules\Leave\Application\Services\LeaveRequestService;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Payroll\Application\Services\PayrollService;
use Modules\Recruitment\Application\Services\RecruitmentService;
use Modules\Workforce\Application\Services\EmployeeService;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class ExecutiveDashboardService
{
    public function __construct(
        private readonly EmployeeService $employees,
        private readonly AttendanceService $attendance,
        private readonly LeaveRequestService $leaveRequests,
        private readonly PayrollService $payrolls,
        private readonly RecruitmentService $recruitment,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor): array
    {
        $today = Carbon::today();
        $workforce = $this->employees->dashboardSummary();
        $attendanceOverview = $this->attendance->overview($actor);
        $leaveOverview = $this->leaveRequests->overview($actor);
        $payrollOverview = $this->payrolls->overview($actor);
        $recruitmentOverview = $this->recruitment->overview($actor);

        $totalEmployees = (int) ($workforce['metrics']['total_employees'] ?? 0);
        $activeEmployees = (int) ($workforce['metrics']['active_employees'] ?? 0);
        $attendanceToday = AttendanceRecord::query()
            ->whereDate('attendance_date', $today)
            ->whereNotNull('clock_in_at')
            ->count();
        $lateEmployeesToday = AttendanceRecord::query()
            ->whereDate('attendance_date', $today)
            ->where('is_late', true)
            ->count();
        $leaveToday = LeaveRequest::query()
            ->where('status', 'approved')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->count();
        $departmentRows = $this->departmentRows($totalEmployees);
        $latestRun = $payrollOverview['latest_run'] ?? null;
        $latestRunMeta = is_array($latestRun?->meta) ? $latestRun->meta : [];
        $latestRunSummary = is_array($latestRunMeta['summary'] ?? null)
            ? $latestRunMeta['summary']
            : null;
        $currentPayrollGross = (float) ($payrollOverview['stats']['current_month_gross'] ?? 0);
        $currentPayrollNet = (float) ($payrollOverview['stats']['current_month_net'] ?? 0);
        $payrollDisplayMonth = ($currentPayrollGross > 0 || $currentPayrollNet > 0)
            ? $today->format('Y-m')
            : ($payrollOverview['stats']['latest_month'] ?? null);

        return [
            'date' => $today->toDateString(),
            'metrics' => [
                ...$workforce['metrics'],
                'attendance_today' => $attendanceToday,
                'late_employees_today' => $lateEmployeesToday,
                'leave_today' => $leaveToday,
            ],
            'attendance' => [
                'today' => [
                    'date' => $today->toDateString(),
                    'attendance_count' => $attendanceToday,
                    'late_count' => $lateEmployeesToday,
                    'on_time_count' => max(0, $attendanceToday - $lateEmployeesToday),
                    'on_leave_count' => $leaveToday,
                    'attendance_rate' => $totalEmployees > 0 ? round(($attendanceToday / $totalEmployees) * 100, 1) : 0,
                ],
                'month' => $attendanceOverview['stats'],
            ],
            'leave' => [
                'today_count' => $leaveToday,
                'pending_requests' => $leaveOverview['stats']['pending_requests'],
                'pending_approvals' => $leaveOverview['stats']['pending_approvals'],
                'upcoming_approved' => $leaveOverview['stats']['upcoming_approved'],
                'available_days_total' => $leaveOverview['stats']['available_days_total'],
            ],
            'payroll' => [
                'display_month' => $payrollDisplayMonth,
                'stats' => [
                    ...$payrollOverview['stats'],
                    'display_gross' => $currentPayrollGross > 0 ? $currentPayrollGross : (float) ($latestRunSummary['gross_total'] ?? 0),
                    'display_net' => $currentPayrollNet > 0 ? $currentPayrollNet : (float) ($latestRunSummary['net_total'] ?? 0),
                ],
                'latest_run' => $latestRun,
            ],
            'recruitment' => [
                'stats' => $recruitmentOverview['stats'],
                'pipeline' => $recruitmentOverview['pipeline'],
                'upcoming_interviews' => $recruitmentOverview['upcoming_interviews'],
                'vacancy_snapshot' => $recruitmentOverview['vacancy_snapshot'],
            ],
            'departments' => [
                'total' => (int) ($workforce['metrics']['total_departments'] ?? 0),
                'items' => $departmentRows,
            ],
            'charts' => [
                'department_headcount' => $departmentRows,
                'employment_status' => $this->employmentStatusChart(),
                'attendance_status_today' => $this->attendanceStatusChart($today),
                'hiring_trend' => $this->hiringTrend($today),
                'recruitment_pipeline' => $recruitmentOverview['pipeline'],
            ],
            'statistics' => [
                'active_employee_ratio' => $totalEmployees > 0 ? round(($activeEmployees / $totalEmployees) * 100, 1) : 0,
                'attendance_capture_rate' => $totalEmployees > 0 ? round(($attendanceToday / $totalEmployees) * 100, 1) : 0,
                'payroll_completion_rate' => ($payrollOverview['stats']['runs_total'] ?? 0) > 0
                    ? round((($payrollOverview['stats']['approved_runs'] ?? 0) / $payrollOverview['stats']['runs_total']) * 100, 1)
                    : 0,
                'offer_acceptance_rate' => (float) ($recruitmentOverview['stats']['offer_acceptance_rate'] ?? 0),
                'pending_leave_approvals' => (int) ($leaveOverview['stats']['pending_approvals'] ?? 0),
                'pending_attendance_corrections' => (int) ($attendanceOverview['stats']['pending_corrections'] ?? 0),
                'pending_payroll_approvals' => (int) ($payrollOverview['stats']['pending_approvals'] ?? 0),
            ],
            'recent_hires' => $workforce['recent_hires'],
            'activity_timeline' => AuditLog::query()
                ->with('actor')
                ->latest('created_at')
                ->limit(12)
                ->get(),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function departmentRows(int $totalEmployees): array
    {
        return Department::query()
            ->with('head:id,employee_number,first_name,middle_name,last_name,job_title')
            ->withCount([
                'employees',
                'employees as active_employees_count' => static fn ($query) => $query->where('employment_status', 'active'),
            ])
            ->orderByDesc('employees_count')
            ->orderBy('name')
            ->limit(6)
            ->get()
            ->map(static function (Department $department) use ($totalEmployees): array {
                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'code' => $department->code,
                    'employees_count' => (int) $department->employees_count,
                    'active_employees_count' => (int) $department->active_employees_count,
                    'share_of_workforce' => $totalEmployees > 0 ? round(((int) $department->employees_count / $totalEmployees) * 100, 1) : 0,
                    'head' => $department->head ? [
                        'id' => $department->head->id,
                        'employee_number' => $department->head->employee_number,
                        'full_name' => $department->head->full_name,
                        'job_title' => $department->head->job_title,
                    ] : null,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function employmentStatusChart(): array
    {
        return Employee::query()
            ->selectRaw('employment_status, COUNT(*) as aggregate')
            ->groupBy('employment_status')
            ->orderByDesc('aggregate')
            ->get()
            ->map(static fn ($row): array => [
                'status' => (string) $row->employment_status,
                'label' => str((string) $row->employment_status)->replace('-', ' ')->headline()->toString(),
                'value' => (int) $row->aggregate,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function attendanceStatusChart(Carbon $today): array
    {
        return AttendanceRecord::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->whereDate('attendance_date', $today)
            ->groupBy('status')
            ->orderByDesc('aggregate')
            ->get()
            ->map(static fn ($row): array => [
                'status' => (string) $row->status,
                'label' => str((string) $row->status)->replace('-', ' ')->headline()->toString(),
                'value' => (int) $row->aggregate,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function hiringTrend(Carbon $today): array
    {
        return collect(range(5, 0))
            ->map(static function (int $offset) use ($today): array {
                $month = $today->copy()->startOfMonth()->subMonths($offset);

                return [
                    'month' => $month->format('Y-m'),
                    'label' => $month->format('M Y'),
                    'hires' => Employee::query()
                        ->whereBetween('hire_date', [$month->copy()->startOfMonth(), $month->copy()->endOfMonth()])
                        ->count(),
                ];
            })
            ->all();
    }
}
