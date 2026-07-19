<?php

namespace Database\Seeders\RBAC;

use Illuminate\Database\Seeder;
use Modules\AccessControl\Infrastructure\Persistence\Models\Permission;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            ['code' => 'dashboard.view', 'label' => 'View Dashboard', 'group' => 'dashboard'],
            ['code' => 'organization.view', 'label' => 'View Organization', 'group' => 'organization'],
            ['code' => 'teams.manage', 'label' => 'Manage Teams', 'group' => 'organization'],
            ['code' => 'employees.view', 'label' => 'View Employees', 'group' => 'employees'],
            ['code' => 'employees.create', 'label' => 'Create Employees', 'group' => 'employees'],
            ['code' => 'employees.update', 'label' => 'Update Employees', 'group' => 'employees'],
            ['code' => 'employees.delete', 'label' => 'Delete Employees', 'group' => 'employees'],
            ['code' => 'leave-requests.view', 'label' => 'View Leave Requests', 'group' => 'leave'],
            ['code' => 'leave-requests.create', 'label' => 'Create Leave Requests', 'group' => 'leave'],
            ['code' => 'leave-requests.approve', 'label' => 'Approve Leave Requests', 'group' => 'leave'],
            ['code' => 'audit.view', 'label' => 'View Audit Logs', 'group' => 'governance'],
            ['code' => 'roles.manage', 'label' => 'Manage Roles', 'group' => 'access-control'],
            ['code' => 'users.manage', 'label' => 'Manage Users', 'group' => 'access-control'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['code' => $permission['code']],
                $permission + ['description' => null],
            );
        }

        $roles = [
            'administrator' => array_column($permissions, 'code'),
            'hr-manager' => [
                'dashboard.view',
                'organization.view',
                'teams.manage',
                'employees.view',
                'employees.create',
                'employees.update',
                'leave-requests.view',
                'leave-requests.create',
                'leave-requests.approve',
                'audit.view',
            ],
            'manager' => [
                'dashboard.view',
                'organization.view',
                'employees.view',
                'leave-requests.view',
                'leave-requests.approve',
            ],
            'employee' => [
                'dashboard.view',
                'organization.view',
                'leave-requests.view',
                'leave-requests.create',
            ],
        ];

        foreach ($roles as $name => $codes) {
            $role = Role::query()->updateOrCreate(
                ['name' => $name],
                [
                    'label' => str($name)->headline()->toString(),
                    'description' => 'Auto-generated baseline role for Enterprise HRIS.',
                ],
            );

            $role->permissions()->sync(
                Permission::query()->whereIn('code', $codes)->pluck('id')->all(),
            );
        }
    }
}
