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
            ['code' => 'dashboard.view', 'label' => 'View Dashboard', 'group' => 'dashboard', 'description' => 'Access the main HRIS dashboard and summary cards.'],
            ['code' => 'organization.view', 'label' => 'View Organization', 'group' => 'organization', 'description' => 'See department and organization structure data.'],
            ['code' => 'teams.manage', 'label' => 'Manage Teams', 'group' => 'organization', 'description' => 'Create and organize teams inside the company structure.'],
            ['code' => 'employees.view', 'label' => 'View Employees', 'group' => 'employees', 'description' => 'Open the employee directory and employee profiles.'],
            ['code' => 'employees.create', 'label' => 'Create Employees', 'group' => 'employees', 'description' => 'Create new employee records.'],
            ['code' => 'employees.update', 'label' => 'Update Employees', 'group' => 'employees', 'description' => 'Edit employee information.'],
            ['code' => 'employees.delete', 'label' => 'Archive Employees', 'group' => 'employees', 'description' => 'Archive or remove employee records from the active directory.'],
            ['code' => 'leave-requests.view', 'label' => 'View Leave Requests', 'group' => 'leave', 'description' => 'See leave requests that are visible to the current role.'],
            ['code' => 'leave-requests.create', 'label' => 'Create Leave Requests', 'group' => 'leave', 'description' => 'Submit a leave request.'],
            ['code' => 'leave-requests.approve', 'label' => 'Approve Leave Requests', 'group' => 'leave', 'description' => 'Review and approve queued leave requests.'],
            ['code' => 'attendance.view', 'label' => 'View Attendance', 'group' => 'attendance', 'description' => 'Open attendance records, shift context, correction history, and daily attendance summaries.'],
            ['code' => 'attendance.clock', 'label' => 'Clock Attendance', 'group' => 'attendance', 'description' => 'Perform self-service clock in and clock out actions.'],
            ['code' => 'attendance.manual', 'label' => 'Manage Manual Attendance', 'group' => 'attendance', 'description' => 'Create or backfill manual attendance entries for employees.'],
            ['code' => 'attendance.manage', 'label' => 'Manage Attendance Setup', 'group' => 'attendance', 'description' => 'Configure attendance shifts, holidays, and shift assignments.'],
            ['code' => 'attendance.report', 'label' => 'View Attendance Reports', 'group' => 'attendance', 'description' => 'Review attendance reports and workforce timekeeping summaries.'],
            ['code' => 'attendance.approve', 'label' => 'Approve Attendance Corrections', 'group' => 'attendance', 'description' => 'Review and decide attendance correction requests.'],
            ['code' => 'attendance.corrections.create', 'label' => 'Create Attendance Corrections', 'group' => 'attendance', 'description' => 'Submit attendance correction requests for a recorded day.'],
            ['code' => 'audit.view', 'label' => 'View Audit Logs', 'group' => 'governance', 'description' => 'Inspect activity and governance audit logs.'],
            ['code' => 'roles.manage', 'label' => 'Manage Role Permissions', 'group' => 'access-control', 'description' => 'Change permission matrices for roles from the dashboard.'],
            ['code' => 'users.manage', 'label' => 'Manage User Roles', 'group' => 'access-control', 'description' => 'Assign roles to users from the dashboard.'],
            ['code' => 'recruitment.view', 'label' => 'View Recruitment Data', 'group' => 'recruitment', 'description' => 'Access recruitment-oriented data and views.'],
            ['code' => 'recruitment.manage', 'label' => 'Manage Recruitment', 'group' => 'recruitment', 'description' => 'Perform recruitment operations and workflow changes.'],
            ['code' => 'performance.view', 'label' => 'View Performance Data', 'group' => 'performance', 'description' => 'Access KPI, OKR, performance review, and performance dashboard data.'],
            ['code' => 'performance.manage', 'label' => 'Manage Performance', 'group' => 'performance', 'description' => 'Configure performance cycles, assign reviews, and manage goal records.'],
            ['code' => 'performance.review', 'label' => 'Review Performance', 'group' => 'performance', 'description' => 'Submit self reviews, manager reviews, feedback, and goal progress updates.'],
            ['code' => 'assets.view', 'label' => 'View IT Assets', 'group' => 'assets', 'description' => 'Access IT asset inventory, assignment history, warranty, and maintenance data.'],
            ['code' => 'assets.manage', 'label' => 'Manage IT Assets', 'group' => 'assets', 'description' => 'Create IT assets and manage assignment, return, maintenance, and asset lifecycle changes.'],
            ['code' => 'notifications.view', 'label' => 'View Notifications', 'group' => 'notifications', 'description' => 'Open the notification center, read inbox items, and review personal delivery history.'],
            ['code' => 'notifications.manage', 'label' => 'Manage Notifications', 'group' => 'notifications', 'description' => 'Broadcast notifications and update notification channel configuration.'],
            ['code' => 'payroll.view', 'label' => 'View Payroll Data', 'group' => 'payroll', 'description' => 'Access payroll-oriented data and summaries.'],
            ['code' => 'payroll.manage', 'label' => 'Manage Payroll', 'group' => 'payroll', 'description' => 'Perform payroll processing and updates.'],
            ['code' => 'security.support', 'label' => 'Security Support Actions', 'group' => 'support', 'description' => 'Assist with account security and support-related remediation.'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->updateOrCreate(
                ['code' => $permission['code']],
                $permission,
            );
        }

        $roles = [
            'super-admin' => [
                'label' => 'Super Admin',
                'description' => 'Full system access with unrestricted platform control.',
                'permissions' => array_column($permissions, 'code'),
            ],
            'hr-manager' => [
                'label' => 'HR Manager',
                'description' => 'Leads HR operations, approvals, and workforce administration.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'teams.manage',
                    'employees.view',
                    'employees.create',
                    'employees.update',
                    'attendance.view',
                    'attendance.clock',
                    'attendance.manual',
                    'attendance.manage',
                    'attendance.report',
                    'attendance.approve',
                    'attendance.corrections.create',
                    'leave-requests.view',
                    'leave-requests.create',
                    'leave-requests.approve',
                    'notifications.view',
                    'notifications.manage',
                    'payroll.view',
                    'payroll.manage',
                    'audit.view',
                    'users.manage',
                    'recruitment.view',
                    'recruitment.manage',
                    'performance.view',
                    'performance.manage',
                    'performance.review',
                    'assets.view',
                ],
            ],
            'hr-staff' => [
                'label' => 'HR Staff',
                'description' => 'Supports employee administration and day-to-day HR tasks.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'employees.view',
                    'employees.create',
                    'employees.update',
                    'attendance.view',
                    'attendance.clock',
                    'attendance.manual',
                    'attendance.manage',
                    'leave-requests.view',
                    'notifications.view',
                    'payroll.view',
                    'recruitment.view',
                    'recruitment.manage',
                    'performance.view',
                    'performance.manage',
                    'performance.review',
                ],
            ],
            'department-manager' => [
                'label' => 'Department Manager',
                'description' => 'Supervises department teams and approves team leave requests.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'employees.view',
                    'attendance.view',
                    'attendance.clock',
                    'attendance.report',
                    'attendance.approve',
                    'leave-requests.view',
                    'leave-requests.approve',
                    'notifications.view',
                    'performance.view',
                    'performance.review',
                ],
            ],
            'employee' => [
                'label' => 'Employee',
                'description' => 'Standard employee access for self-service and personal workflow.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'attendance.view',
                    'attendance.clock',
                    'attendance.corrections.create',
                    'leave-requests.view',
                    'leave-requests.create',
                    'notifications.view',
                    'payroll.view',
                    'performance.view',
                    'performance.review',
                ],
            ],
            'recruitment-officer' => [
                'label' => 'Recruitment Officer',
                'description' => 'Handles hiring coordination and recruitment-facing workforce data.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'employees.view',
                    'employees.create',
                    'employees.update',
                    'attendance.view',
                    'notifications.view',
                    'recruitment.view',
                    'recruitment.manage',
                ],
            ],
            'payroll-officer' => [
                'label' => 'Payroll Officer',
                'description' => 'Responsible for payroll visibility and payroll processing tasks.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'employees.view',
                    'attendance.view',
                    'attendance.clock',
                    'attendance.report',
                    'notifications.view',
                    'payroll.view',
                    'payroll.manage',
                ],
            ],
            'auditor' => [
                'label' => 'Auditor',
                'description' => 'Reviews organization, workforce, and governance evidence in read-only mode.',
                'permissions' => [
                    'dashboard.view',
                    'organization.view',
                    'employees.view',
                    'attendance.view',
                    'attendance.report',
                    'assets.view',
                    'notifications.view',
                    'leave-requests.view',
                    'payroll.view',
                    'recruitment.view',
                    'performance.view',
                    'audit.view',
                ],
            ],
            'it-support' => [
                'label' => 'IT Support',
                'description' => 'Supports access recovery, user role operations, and security troubleshooting.',
                'permissions' => [
                    'dashboard.view',
                    'assets.view',
                    'assets.manage',
                    'notifications.view',
                    'notifications.manage',
                    'users.manage',
                    'audit.view',
                    'security.support',
                ],
            ],
        ];

        foreach ($roles as $name => $roleDefinition) {
            $role = Role::query()->updateOrCreate(
                ['name' => $name],
                [
                    'label' => $roleDefinition['label'],
                    'description' => $roleDefinition['description'],
                ],
            );

            $role->permissions()->sync(
                Permission::query()->whereIn('code', $roleDefinition['permissions'])->pluck('id')->all(),
            );
        }

        $this->migrateLegacyRole('administrator', 'super-admin');
        $this->migrateLegacyRole('manager', 'department-manager');
    }

    private function migrateLegacyRole(string $legacyName, string $newName): void
    {
        $legacyRole = Role::query()->where('name', $legacyName)->first();
        $newRole = Role::query()->where('name', $newName)->first();

        if (! $legacyRole || ! $newRole) {
            return;
        }

        $legacyRole->loadMissing('users');

        foreach ($legacyRole->users as $user) {
            $user->roles()->syncWithoutDetaching([$newRole->id]);
        }

        $legacyRole->users()->detach();
        $legacyRole->permissions()->detach();
        $legacyRole->delete();
    }
}
