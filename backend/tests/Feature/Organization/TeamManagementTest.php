<?php

namespace Tests\Feature\Organization;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class TeamManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_hr_manager_can_create_team(): void
    {
        $this->seed(DatabaseSeeder::class);

        $department = Department::query()->where('code', 'ENG')->firstOrFail();
        $lead = Employee::query()->where('employee_number', 'EMP-0001')->firstOrFail();

        $response = $this->postJson('/api/v1/teams', [
            'department_id' => $department->id,
            'name' => 'Quality Engineering',
            'code' => 'ENG-QA',
            'description' => 'Automation and quality governance.',
            'lead_employee_id' => $lead->id,
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $response
            ->assertCreated()
            ->assertJsonPath('data.code', 'ENG-QA');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'organization.team.created',
        ]);
    }

    public function test_manager_without_team_permission_cannot_create_team(): void
    {
        $this->seed(DatabaseSeeder::class);

        $department = Department::query()->where('code', 'ENG')->firstOrFail();

        $response = $this->postJson('/api/v1/teams', [
            'department_id' => $department->id,
            'name' => 'Delivery Excellence',
            'code' => 'ENG-DLX',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $response->assertForbidden();
    }
}
