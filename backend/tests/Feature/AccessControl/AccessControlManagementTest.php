<?php

namespace Tests\Feature\AccessControl;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\AccessControl\Infrastructure\Persistence\Models\Permission;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Tests\TestCase;

class AccessControlManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_seed_creates_default_roles_and_permissions(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('roles', 9);
        $this->assertDatabaseHas('roles', ['name' => 'super-admin', 'label' => 'Super Admin']);
        $this->assertDatabaseHas('roles', ['name' => 'it-support', 'label' => 'IT Support']);
        $this->assertDatabaseHas('permissions', ['code' => 'roles.manage']);
        $this->assertDatabaseHas('permissions', ['code' => 'payroll.manage']);
    }

    public function test_super_admin_can_view_access_control_overview(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->getJson('/api/v1/access-control', $this->authenticateEmail('admin@enterprise-hris.local'));

        $response
            ->assertOk()
            ->assertJsonPath('data.can_manage_roles', true)
            ->assertJsonPath('data.can_manage_users', true)
            ->assertJsonCount(9, 'data.roles');
    }

    public function test_super_admin_can_update_role_permissions(): void
    {
        $this->seed(DatabaseSeeder::class);

        $role = Role::query()->where('name', 'department-manager')->firstOrFail();
        $permissions = Permission::query()
            ->whereIn('code', ['dashboard.view', 'employees.view', 'users.manage'])
            ->pluck('id')
            ->all();

        $response = $this->putJson(
            "/api/v1/access-control/roles/{$role->id}/permissions",
            ['permission_ids' => $permissions],
            $this->authenticateEmail('admin@enterprise-hris.local'),
        );

        $response
            ->assertOk()
            ->assertJsonPath('data.name', 'department-manager');

        $this->assertDatabaseHas('permission_role', [
            'role_id' => $role->id,
            'permission_id' => $permissions[2],
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'access-control.role-permissions.updated',
        ]);
    }

    public function test_user_role_assignments_can_be_changed_from_dashboard(): void
    {
        $this->seed(DatabaseSeeder::class);

        $targetUser = \App\Models\User::query()->where('email', 'dina.staff@enterprise-hris.local')->firstOrFail();
        $roleIds = Role::query()
            ->whereIn('name', ['hr-staff', 'payroll-officer'])
            ->pluck('id')
            ->all();

        $response = $this->putJson(
            "/api/v1/access-control/users/{$targetUser->id}/roles",
            ['role_ids' => $roleIds],
            $this->authenticateEmail('admin@enterprise-hris.local'),
        );

        $response
            ->assertOk()
            ->assertJsonCount(2, 'data.roles');

        $this->assertDatabaseHas('role_user', [
            'user_id' => $targetUser->id,
            'role_id' => $roleIds[1],
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'access-control.user-roles.updated',
        ]);
    }

    public function test_user_without_role_management_permission_cannot_update_role_permissions(): void
    {
        $this->seed(DatabaseSeeder::class);

        $role = Role::query()->where('name', 'employee')->firstOrFail();
        $permissions = Permission::query()->where('code', 'dashboard.view')->pluck('id')->all();

        $this->putJson(
            "/api/v1/access-control/roles/{$role->id}/permissions",
            ['permission_ids' => $permissions],
            $this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        )->assertForbidden();
    }
}
