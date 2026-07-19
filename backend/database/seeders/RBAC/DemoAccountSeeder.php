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
                'role' => 'manager',
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
        ];

        foreach ($accounts as $account) {
            $user = User::query()->updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => 'Password123!',
                    'status' => 'active',
                ],
            );

            $role = Role::query()->where('name', $account['role'])->firstOrFail();
            $user->roles()->syncWithoutDetaching([$role->id]);

            $employee = Employee::query()->where('employee_number', $account['employee_number'])->first();

            if ($employee) {
                $employee->forceFill(['user_id' => $user->id])->save();
            }
        }
    }
}
