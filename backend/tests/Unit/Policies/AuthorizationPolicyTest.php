<?php

namespace Tests\Unit\Policies;

use App\Models\User;
use App\Policies\AuditLogPolicy;
use App\Policies\EmployeePolicy;
use App\Policies\LeaveRequestPolicy;
use App\Policies\TeamPolicy;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveApproval;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class AuthorizationPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_gate_before_allows_super_admin_for_any_ability(): void
    {
        $this->seed(DatabaseSeeder::class);

        $superAdmin = User::query()->where('email', 'admin@enterprise-hris.local')->firstOrFail();

        $this->assertTrue(Gate::forUser($superAdmin)->allows('viewAny', Team::class));
        $this->assertTrue(Gate::forUser($superAdmin)->allows('non-existent-ability'));
    }

    public function test_employee_policy_respects_role_permissions(): void
    {
        $this->seed(DatabaseSeeder::class);

        $hrStaff = User::query()->where('email', 'dina.staff@enterprise-hris.local')->firstOrFail();
        $employeePolicy = new EmployeePolicy();
        $employee = new Employee();

        $this->assertTrue($employeePolicy->viewAny($hrStaff));
        $this->assertTrue($employeePolicy->view($hrStaff, $employee));
        $this->assertTrue($employeePolicy->create($hrStaff));
        $this->assertTrue($employeePolicy->update($hrStaff, $employee));
        $this->assertFalse($employeePolicy->delete($hrStaff, $employee));
    }

    public function test_team_and_audit_log_policies_respect_permissions(): void
    {
        $this->seed(DatabaseSeeder::class);

        $hrManager = User::query()->where('email', 'rafi.saputra@enterprise-hris.local')->firstOrFail();
        $employee = User::query()->where('email', 'nadia.putri@enterprise-hris.local')->firstOrFail();
        $auditor = User::query()->where('email', 'yudha.auditor@enterprise-hris.local')->firstOrFail();

        $teamPolicy = new TeamPolicy();
        $auditLogPolicy = new AuditLogPolicy();

        $this->assertTrue($teamPolicy->viewAny($hrManager));
        $this->assertTrue($teamPolicy->create($hrManager));
        $this->assertFalse($teamPolicy->create($employee));
        $this->assertTrue($auditLogPolicy->viewAny($auditor));
        $this->assertFalse($auditLogPolicy->viewAny($employee));
    }

    public function test_leave_request_policy_requires_pending_assigned_approval(): void
    {
        $this->seed(DatabaseSeeder::class);

        $manager = User::query()->where('email', 'alya.pratama@enterprise-hris.local')->firstOrFail();
        $employee = User::query()->where('email', 'nadia.putri@enterprise-hris.local')->firstOrFail();
        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();
        $employeeProfile = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $leaveRequest = LeaveRequest::query()->create([
            'employee_id' => $employeeProfile->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-07-22',
            'end_date' => '2026-07-23',
            'total_days' => '2.00',
            'reason' => 'Policy authorization coverage.',
            'status' => 'pending_manager',
            'submitted_at' => now(),
        ]);

        LeaveApproval::query()->create([
            'leave_request_id' => $leaveRequest->id,
            'approver_id' => $manager->id,
            'stage' => 'manager',
            'status' => 'pending',
        ]);

        $policy = new LeaveRequestPolicy();

        $this->assertTrue($policy->viewAny($employee));
        $this->assertTrue($policy->create($employee));
        $this->assertTrue($policy->approve($manager, $leaveRequest));
        $this->assertTrue($policy->reject($manager, $leaveRequest));
        $this->assertFalse($policy->approve($employee, $leaveRequest));

        $leaveRequest->approvals()->update(['status' => 'approved']);

        $this->assertFalse($policy->approve($manager, $leaveRequest->fresh()));
    }
}
