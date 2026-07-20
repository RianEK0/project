<?php

namespace Database\Seeders\RBAC;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class DemoAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'email' => 'alya.pratama@enterprise-hris.local',
                'name' => 'Alya Pratama',
                'role' => 'department-manager',
                'employee_number' => 'EMP-0001',
            ],
            [
                'email' => 'rafi.saputra@enterprise-hris.local',
                'name' => 'Rafi Saputra',
                'role' => 'hr-manager',
                'employee_number' => 'EMP-0002',
            ],
            [
                'email' => 'nadia.putri@enterprise-hris.local',
                'name' => 'Nadia Putri',
                'role' => 'employee',
                'employee_number' => 'EMP-0003',
            ],
            [
                'email' => 'dina.staff@enterprise-hris.local',
                'name' => 'Dina HR Staff',
                'role' => 'hr-staff',
                'employee_number' => null,
            ],
            [
                'email' => 'bagas.recruitment@enterprise-hris.local',
                'name' => 'Bagas Recruitment',
                'role' => 'recruitment-officer',
                'employee_number' => null,
            ],
            [
                'email' => 'mira.payroll@enterprise-hris.local',
                'name' => 'Mira Payroll',
                'role' => 'payroll-officer',
                'employee_number' => null,
            ],
            [
                'email' => 'yudha.auditor@enterprise-hris.local',
                'name' => 'Yudha Auditor',
                'role' => 'auditor',
                'employee_number' => null,
            ],
            [
                'email' => 'nara.support@enterprise-hris.local',
                'name' => 'Nara IT Support',
                'role' => 'it-support',
                'employee_number' => null,
            ],
        ];

        foreach ($accounts as $account) {
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => 'Password123!',
                    'status' => 'active',
                    'email_verified_at' => now(),
                    'password_changed_at' => now(),
                ],
            );

            $role = Role::query()->where('name', $account['role'])->firstOrFail();
            $user->roles()->sync([$role->id]);

            $employee = $account['employee_number']
                ? Employee::query()->where('employee_number', $account['employee_number'])->first()
                : null;

            if ($employee) {
                $employee->forceFill(['user_id' => $user->id])->save();
            }
        }
    }
}
