<?php

namespace Tests\Feature\Leave;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveBalance;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class LeaveWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_leave_request_flows_from_manager_to_hr_approval(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();

        $createResponse = $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(5)->toDateString(),
            'end_date' => now()->addDays(7)->toDateString(),
            'reason' => 'Family event outside the city requiring travel days.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_manager')
            ->assertJsonPath('data.approvals.0.stage', 'manager');

        $leaveRequest = LeaveRequest::query()->firstOrFail();

        $managerResponse = $this->postJson("/api/v1/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Please hand over sprint tasks before leave starts.',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $managerResponse->assertOk()->assertJsonPath('data.status', 'pending_hr');

        $hrResponse = $this->postJson("/api/v1/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Approved from HR.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $hrResponse->assertOk()->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'leave-request.created',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'leave-request.approved',
        ]);
    }

    public function test_manager_sees_pending_approval_inbox(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();

        $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(12)->toDateString(),
            'reason' => 'Personal travel and recovery time after project milestone.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'))->assertCreated();

        $inboxResponse = $this->getJson('/api/v1/approvals/inbox', $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $inboxResponse
            ->assertOk()
            ->assertJsonPath('data.0.stage', 'manager')
            ->assertJsonPath('data.0.leave_request.employee.employee_number', 'EMP-0003');
    }

    public function test_leave_request_excludes_seeded_holiday_from_annual_leave_balance(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $response = $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-08-17',
            'end_date' => '2026-08-18',
            'reason' => 'Taking leave around the public holiday for a family commitment.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $response
            ->assertCreated()
            ->assertJsonPath('data.total_days', '1.00')
            ->assertJsonPath('data.calendar_days', 2)
            ->assertJsonPath('data.skipped_holidays.0', '2026-08-17');

        $balance = LeaveBalance::query()
            ->where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', 2026)
            ->firstOrFail();

        $this->assertSame('1.00', $balance->pending_days);
        $this->assertSame(13.0, $balance->available_days);
    }

    public function test_final_leave_approval_moves_reserved_balance_to_used_balance(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-07-27',
            'end_date' => '2026-07-29',
            'reason' => 'Annual leave for family trip planned after release week.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'))->assertCreated();

        $leaveRequest = LeaveRequest::query()->firstOrFail();

        $this->postJson("/api/v1/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Team coverage is confirmed.',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'))->assertOk();

        $this->postJson("/api/v1/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Final HR approval completed.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'))->assertOk();

        $balance = LeaveBalance::query()
            ->where('employee_id', $employee->id)
            ->where('leave_type_id', $leaveType->id)
            ->where('year', 2026)
            ->firstOrFail();

        $this->assertSame('0.00', $balance->pending_days);
        $this->assertSame('3.00', $balance->used_days);
        $this->assertSame(11.0, $balance->available_days);
    }

    public function test_leave_overview_and_calendar_include_upcoming_leave_and_holiday_context(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();

        $createResponse = $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-08-18',
            'end_date' => '2026-08-19',
            'reason' => 'Approved leave after the Independence Day break.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $leaveRequestId = $createResponse->json('data.id');

        $this->postJson("/api/v1/leave-requests/{$leaveRequestId}/approve", [
            'remarks' => 'Manager approval completed.',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'))->assertOk();

        $this->postJson("/api/v1/leave-requests/{$leaveRequestId}/approve", [
            'remarks' => 'HR approval completed.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'))->assertOk();

        $overviewResponse = $this->getJson('/api/v1/leave-overview', $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $overviewResponse
            ->assertOk()
            ->assertJsonPath('data.stats.upcoming_approved', 1)
            ->assertJsonFragment([
                'type' => 'upcoming_leave',
                'date' => '2026-08-18',
            ])
            ->assertJsonFragment([
                'name' => 'Independence Day',
                'holiday_date' => '2026-08-17',
            ]);

        $calendarResponse = $this->getJson('/api/v1/leave-calendar?month=2026-08', $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $calendarResponse
            ->assertOk()
            ->assertJsonPath('data.month', '2026-08')
            ->assertJsonFragment([
                'type' => 'holiday',
                'title' => 'Independence Day',
                'status' => 'public',
            ])
            ->assertJsonFragment([
                'type' => 'leave',
                'status' => 'approved',
                'leave_request_id' => $leaveRequestId,
            ]);
    }

}
