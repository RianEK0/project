<?php

namespace Tests\Feature\Governance;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_view_audit_logs(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();

        $headers = [
            'User-Agent' => 'PHPUnit Browser',
            ...$this->authenticateEmail('nadia.putri@enterprise-hris.local'),
        ];

        $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(14)->toDateString(),
            'end_date' => now()->addDays(15)->toDateString(),
            'reason' => 'Annual leave for personal appointments and rest.',
        ], $headers)->assertCreated();

        $response = $this->getJson('/api/v1/audit-logs?per_page=100', $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $response->assertOk();

        $leaveRequestLog = collect($response->json('data'))
            ->firstWhere('action', 'leave-request.created');

        $this->assertNotNull($leaveRequestLog);
        $this->assertSame('PHPUnit', $leaveRequestLog['browser']);
        $this->assertSame('PHPUnit Browser', $leaveRequestLog['user_agent']);
    }

    public function test_employee_update_creates_automatic_audit_log_with_old_and_new_values(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();
        $headers = [
            'User-Agent' => 'PHPUnit Browser',
            ...$this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        ];

        $this->putJson("/api/v1/employees/{$employee->id}", [
            'employee_number' => $employee->employee_number,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'preferred_name' => $employee->preferred_name,
            'work_email' => $employee->work_email,
            'personal_email' => $employee->personal_email,
            'phone' => $employee->phone,
            'gender' => $employee->gender,
            'marital_status' => $employee->marital_status,
            'place_of_birth' => $employee->place_of_birth,
            'address' => $employee->address,
            'city' => 'Jakarta',
            'state' => $employee->state,
            'postal_code' => $employee->postal_code,
            'country' => $employee->country,
            'identity_card_number' => $employee->identity_card_number,
            'passport_number' => $employee->passport_number,
            'passport_expiry_date' => $employee->passport_expiry_date?->toDateString(),
            'npwp_number' => $employee->npwp_number,
            'bpjs_health_number' => $employee->bpjs_health_number,
            'bpjs_employment_number' => $employee->bpjs_employment_number,
            'job_title' => 'Senior Backend Engineer',
            'employment_type' => $employee->employment_type,
            'employment_status' => $employee->employment_status,
            'department_id' => $employee->department_id,
            'branch_id' => $employee->branch_id,
            'team_id' => $employee->team_id,
            'division_id' => $employee->division_id,
            'section_id' => $employee->section_id,
            'position_id' => $employee->position_id,
            'manager_id' => $employee->manager_id,
            'user_id' => $employee->user_id,
            'hire_date' => $employee->hire_date?->toDateString(),
            'birth_date' => $employee->birth_date?->toDateString(),
            'meta' => $employee->meta,
        ], $headers)->assertOk();

        $log = AuditLog::query()
            ->where('action', 'record.employee.updated')
            ->latest('id')
            ->firstOrFail();

        $this->assertSame('Backend Engineer', $log->old_values['job_title']);
        $this->assertSame('Senior Backend Engineer', $log->new_values['job_title']);
        $this->assertSame('Bandung', $log->old_values['city']);
        $this->assertSame('Jakarta', $log->new_values['city']);
        $this->assertSame('PHPUnit Browser', $log->user_agent);
    }

    public function test_audit_log_endpoint_supports_pagination_filters_sorting_and_search(): void
    {
        $this->seed(DatabaseSeeder::class);

        $leaveType = LeaveType::query()->where('code', 'ANNUAL')->firstOrFail();

        $this->postJson('/api/v1/leave-requests', [
            'leave_type_id' => $leaveType->id,
            'start_date' => now()->addDays(10)->toDateString(),
            'end_date' => now()->addDays(11)->toDateString(),
            'reason' => 'Annual leave for audit endpoint coverage.',
        ], [
            'User-Agent' => 'PHPUnit Browser',
            ...$this->authenticateEmail('nadia.putri@enterprise-hris.local'),
        ])->assertCreated();

        $response = $this->getJson(
            '/api/v1/audit-logs?action=leave-request.created&search=leave-request&sort_by=action&sort_direction=asc&per_page=1',
            $this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        );

        $response
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.search', 'leave-request')
            ->assertJsonPath('meta.sort.by', 'action')
            ->assertJsonPath('meta.sort.direction', 'asc')
            ->assertJsonPath('meta.filters.action', 'leave-request.created')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.action', 'leave-request.created');
    }
}
