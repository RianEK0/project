<?php

namespace Tests\Feature\Workforce;

use App\Models\User;
use Database\Seeders\RBAC\RbacSeeder;
use Database\Seeders\Workforce\WorkforceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class EmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_create_employee(): void
    {
        $this->seed([RbacSeeder::class, WorkforceSeeder::class]);

        $headers = $this->authenticateAs('hr-manager');
        $department = Department::query()->where('code', 'ENG')->firstOrFail();
        $manager = Employee::query()->where('employee_number', 'EMP-0001')->firstOrFail();

        $response = $this->postJson('/api/v1/employees', [
            'employee_number' => 'EMP-0100',
            'first_name' => 'Dewi',
            'last_name' => 'Kusuma',
            'work_email' => 'dewi.kusuma@example.com',
            'personal_email' => 'dewi.kusuma.personal@example.com',
            'phone' => '+6281234567890',
            'job_title' => 'People Analytics Specialist',
            'employment_type' => 'permanent',
            'employment_status' => 'active',
            'department_id' => $department->id,
            'manager_id' => $manager->id,
            'hire_date' => now()->toDateString(),
            'birth_date' => now()->subYears(28)->toDateString(),
            'meta' => ['location' => 'Jakarta'],
        ], $headers);

        $response
            ->assertCreated()
            ->assertJsonPath('data.employee_number', 'EMP-0100')
            ->assertJsonPath('data.department.code', 'ENG');
    }

    public function test_user_without_create_permission_cannot_create_employee(): void
    {
        $this->seed([RbacSeeder::class, WorkforceSeeder::class]);

        $headers = $this->authenticateAs('department-manager');
        $department = Department::query()->where('code', 'ENG')->firstOrFail();

        $response = $this->postJson('/api/v1/employees', [
            'employee_number' => 'EMP-0101',
            'first_name' => 'Ari',
            'last_name' => 'Wijaya',
            'work_email' => 'ari.wijaya@example.com',
            'job_title' => 'QA Engineer',
            'employment_type' => 'permanent',
            'employment_status' => 'active',
            'department_id' => $department->id,
            'hire_date' => now()->toDateString(),
        ], $headers);

        $response->assertForbidden();
    }

    public function test_employee_detail_returns_comprehensive_management_sections(): void
    {
        $this->seed([RbacSeeder::class, WorkforceSeeder::class]);

        $headers = $this->authenticateAs('hr-manager');
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $response = $this->getJson("/api/v1/employees/{$employee->id}", $headers);

        $response
            ->assertOk()
            ->assertJsonPath('data.employee_code', 'EMP-0003')
            ->assertJsonPath('data.branch.code', 'BDG-HUB')
            ->assertJsonPath('data.division.code', 'ENG-PLATFORM')
            ->assertJsonPath('data.position.code', 'POS-BE')
            ->assertJsonPath('data.experiences.0.company', 'Tech Nusantara')
            ->assertJsonPath('data.certifications.0.name', 'AWS Certified Developer')
            ->assertJsonPath('data.salary_histories.0.component', 'Base Salary')
            ->assertJsonPath('data.contracts.0.contract_type', 'permanent');
    }

    public function test_authorized_user_can_upload_employee_document(): void
    {
        Storage::fake('public');
        $this->seed([RbacSeeder::class, WorkforceSeeder::class]);

        $headers = $this->authenticateAs('hr-manager');
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $response = $this->postJson("/api/v1/employees/{$employee->id}/documents", [
            'category' => 'identity-card',
            'label' => 'NIK Scan',
            'file' => UploadedFile::fake()->image('nik.png'),
        ], $headers);

        $response
            ->assertCreated()
            ->assertJsonPath('data.documents.0.label', 'NIK Scan')
            ->assertJsonPath('data.documents.0.category', 'identity-card');

        $storedFiles = Storage::disk('public')->allFiles("employees/{$employee->id}/documents");
        $this->assertNotEmpty($storedFiles);
    }

    /**
     * @return array<string, string>
     */
    private function authenticateAs(string $roleName): array
    {
        $user = User::factory()->create([
            'name' => str($roleName)->headline()->toString(),
            'email' => "{$roleName}@example.com",
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $role = Role::query()->where('name', $roleName)->firstOrFail();
        $user->roles()->sync([$role->id]);

        return $this->authenticateUser($user);
    }
}
