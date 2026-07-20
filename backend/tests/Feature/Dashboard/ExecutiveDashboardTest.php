<?php

namespace Tests\Feature\Dashboard;

use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceRecord;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceShift;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class ExecutiveDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_returns_executive_workspace_metrics_and_activity_timeline(): void
    {
        Carbon::setTestNow('2026-07-19 09:30:00');
        $this->seed(DatabaseSeeder::class);

        $alya = Employee::query()->where('employee_number', 'EMP-0001')->firstOrFail();
        $rafi = Employee::query()->where('employee_number', 'EMP-0002')->firstOrFail();
        $nadia = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();
        $officeShift = AttendanceShift::query()->where('code', 'OFFICE-JKT')->firstOrFail();
        $approver = User::query()->where('email', 'rafi.saputra@enterprise-hris.local')->firstOrFail();

        AttendanceRecord::query()->updateOrCreate(
            [
                'employee_id' => $alya->id,
                'attendance_date' => '2026-07-19',
            ],
            [
                'attendance_shift_id' => $officeShift->id,
                'status' => 'late',
                'clock_in_at' => Carbon::parse('2026-07-19 09:12:00'),
                'clock_out_at' => Carbon::parse('2026-07-19 18:07:00'),
                'clock_in_source' => 'qr',
                'clock_out_source' => 'qr',
                'is_late' => true,
                'late_minutes' => 7,
                'is_overtime' => false,
                'overtime_minutes' => 0,
                'worked_minutes' => 535,
                'is_weekend' => true,
                'is_holiday' => false,
                'is_corrected' => false,
                'created_by' => $alya->user_id,
                'updated_by' => $alya->user_id,
            ],
        );

        AttendanceRecord::query()->updateOrCreate(
            [
                'employee_id' => $rafi->id,
                'attendance_date' => '2026-07-19',
            ],
            [
                'attendance_shift_id' => $officeShift->id,
                'status' => 'present',
                'clock_in_at' => Carbon::parse('2026-07-19 08:59:00'),
                'clock_out_at' => Carbon::parse('2026-07-19 17:58:00'),
                'clock_in_source' => 'self-service',
                'clock_out_source' => 'self-service',
                'is_late' => false,
                'late_minutes' => 0,
                'is_overtime' => false,
                'overtime_minutes' => 0,
                'worked_minutes' => 539,
                'is_weekend' => true,
                'is_holiday' => false,
                'is_corrected' => false,
                'created_by' => $rafi->user_id,
                'updated_by' => $rafi->user_id,
            ],
        );

        $leaveRequest = LeaveRequest::query()->create([
            'employee_id' => $nadia->id,
            'leave_type_id' => LeaveType::query()->where('code', 'ANNUAL')->value('id'),
            'start_date' => '2026-07-19',
            'end_date' => '2026-07-20',
            'total_days' => 1,
            'reason' => 'Family event.',
            'status' => 'approved',
            'reviewer_id' => $approver->id,
            'submitted_at' => Carbon::parse('2026-07-18 09:00:00'),
            'reviewed_at' => Carbon::parse('2026-07-18 10:00:00'),
        ]);

        AuditLog::query()->create([
            'actor_id' => $approver->id,
            'auditable_type' => $leaveRequest->getMorphClass(),
            'auditable_id' => $leaveRequest->id,
            'action' => 'leave.request.approved',
            'summary' => 'Leave request approved for Nadia Putri.',
            'created_at' => Carbon::parse('2026-07-19 09:25:00'),
        ]);

        $response = $this->getJson('/api/v1/dashboard', $this->authenticateEmail('admin@enterprise-hris.local'));

        $response
            ->assertOk()
            ->assertJsonPath('data.date', '2026-07-19')
            ->assertJsonPath('data.metrics.total_employees', 3)
            ->assertJsonPath('data.metrics.active_employees', 3)
            ->assertJsonPath('data.metrics.attendance_today', 2)
            ->assertJsonPath('data.metrics.late_employees_today', 1)
            ->assertJsonPath('data.metrics.leave_today', 1)
            ->assertJsonPath('data.payroll.display_month', '2026-06')
            ->assertJsonPath('data.payroll.latest_run.payroll_month', '2026-06')
            ->assertJsonPath('data.recruitment.stats.open_vacancies', 2)
            ->assertJsonPath('data.departments.total', 4)
            ->assertJsonPath('data.departments.items.0.name', 'Engineering')
            ->assertJsonPath('data.activity_timeline.0.action', 'leave.request.approved')
            ->assertJsonCount(6, 'data.charts.hiring_trend')
            ->assertJsonCount(7, 'data.charts.recruitment_pipeline');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }
}
