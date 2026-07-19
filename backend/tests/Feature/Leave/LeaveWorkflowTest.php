<?php

namespace Tests\Feature\Leave;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
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
        ], $this->authenticateByEmail('nadia.putri@enterprise-hris.local'));

        $createResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_manager')
            ->assertJsonPath('data.approvals.0.stage', 'manager');

        $leaveRequest = LeaveRequest::query()->firstOrFail();

        $managerResponse = $this->postJson("/api/v1/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Please hand over sprint tasks before leave starts.',
        ], $this->authenticateByEmail('alya.pratama@enterprise-hris.local'));

        $managerResponse->assertOk()->assertJsonPath('data.status', 'pending_hr');

        $hrResponse = $this->postJson("/api/v1/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Approved from HR.',
        ], $this->authenticateByEmail('rafi.saputra@enterprise-hris.local'));

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
        ], $this->authenticateByEmail('nadia.putri@enterprise-hris.local'))->assertCreated();

        $inboxResponse = $this->getJson('/api/v1/approvals/inbox', $this->authenticateByEmail('alya.pratama@enterprise-hris.local'));

        $inboxResponse
            ->assertOk()
            ->assertJsonPath('data.0.stage', 'manager')
            ->assertJsonPath('data.0.leave_request.employee.employee_number', 'EMP-0003');
    }

    /**
     * @return array<string, string>
     */
    private function authenticateByEmail(string $email): array
    {
        $user = User::query()->where('email', $email)->firstOrFail();

        return [
            'Authorization' => 'Bearer '.auth('api')->login($user),
        ];
    }
}
