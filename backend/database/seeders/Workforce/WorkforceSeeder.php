<?php

namespace Database\Seeders\Workforce;

use Illuminate\Database\Seeder;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class WorkforceSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name' => 'Human Resources', 'code' => 'HR', 'cost_center' => 'CC-100'],
            ['name' => 'Engineering', 'code' => 'ENG', 'cost_center' => 'CC-200'],
            ['name' => 'Finance', 'code' => 'FIN', 'cost_center' => 'CC-300'],
            ['name' => 'Operations', 'code' => 'OPS', 'cost_center' => 'CC-400'],
        ];

        foreach ($departments as $department) {
            Department::query()->updateOrCreate(
                ['code' => $department['code']],
                $department + ['description' => null],
            );
        }

        if (Employee::query()->exists()) {
            return;
        }

        $engineering = Department::query()->where('code', 'ENG')->firstOrFail();
        $hr = Department::query()->where('code', 'HR')->firstOrFail();

        $manager = Employee::query()->create([
            'employee_number' => 'EMP-0001',
            'first_name' => 'Alya',
            'last_name' => 'Pratama',
            'work_email' => 'alya.pratama@enterprise-hris.local',
            'job_title' => 'Head of Engineering',
            'employment_type' => 'permanent',
            'employment_status' => 'active',
            'department_id' => $engineering->id,
            'hire_date' => now()->subYears(4)->toDateString(),
            'birth_date' => now()->subYears(32)->toDateString(),
        ]);

        Employee::query()->create([
            'employee_number' => 'EMP-0002',
            'first_name' => 'Rafi',
            'last_name' => 'Saputra',
            'work_email' => 'rafi.saputra@enterprise-hris.local',
            'job_title' => 'Senior HR Business Partner',
            'employment_type' => 'permanent',
            'employment_status' => 'active',
            'department_id' => $hr->id,
            'hire_date' => now()->subYears(3)->toDateString(),
            'birth_date' => now()->subYears(30)->toDateString(),
        ]);

        Employee::query()->create([
            'employee_number' => 'EMP-0003',
            'first_name' => 'Nadia',
            'last_name' => 'Putri',
            'work_email' => 'nadia.putri@enterprise-hris.local',
            'job_title' => 'Backend Engineer',
            'employment_type' => 'permanent',
            'employment_status' => 'active',
            'department_id' => $engineering->id,
            'manager_id' => $manager->id,
            'hire_date' => now()->subMonths(2)->toDateString(),
            'birth_date' => now()->subYears(27)->toDateString(),
        ]);
    }
}
