<?php

namespace Tests\Feature\Organization;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationStructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_view_full_organization_structure(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->getJson(
            '/api/v1/organization/structure',
            $this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.summary.companies', 1)
            ->assertJsonPath('data.summary.sections', 2)
            ->assertJsonPath('data.companies.0.code', 'ENT-HRIS')
            ->assertJsonFragment(['code' => 'ENG-PLATFORM-CORE'])
            ->assertJsonFragment(['code' => 'HR-PEOPLE-SVC'])
            ->assertJsonFragment(['title' => 'Head of Engineering']);
    }

    public function test_hr_manager_can_create_new_organization_unit(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->postJson('/api/v1/organization/units', [
            'type' => 'section',
            'division_id' => 1,
            'name' => 'Developer Experience',
            'code' => 'ENG-DEVEX',
            'description' => 'Developer platform enablement section.',
            'head_employee_id' => 1,
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $response
            ->assertCreated()
            ->assertJsonPath('data.type', 'section')
            ->assertJsonPath('data.item.code', 'ENG-DEVEX');

        $this->assertDatabaseHas('sections', [
            'code' => 'ENG-DEVEX',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'organization.section.created',
        ]);
    }

    public function test_user_without_permission_cannot_create_organization_unit(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->postJson('/api/v1/organization/units', [
            'type' => 'branch',
            'company_id' => 1,
            'name' => 'Surabaya Office',
            'code' => 'SBY-OFF',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $response->assertForbidden();
    }
}
