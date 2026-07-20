<?php

namespace Database\Seeders\Organization;

use Illuminate\Database\Seeder;
use Modules\Organization\Infrastructure\Persistence\Models\Team;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        $engineering = Department::query()->where('code', 'ENG')->firstOrFail();
        $hr = Department::query()->where('code', 'HR')->firstOrFail();

        $engineeringLead = Employee::query()->where('employee_number', 'EMP-0001')->firstOrFail();
        $backendEngineer = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();
        $hrPartner = Employee::query()->where('employee_number', 'EMP-0002')->firstOrFail();

        $platformTeam = Team::query()->updateOrCreate(
            ['code' => 'ENG-PLATFORM'],
            [
                'department_id' => $engineering->id,
                'name' => 'Platform Engineering',
                'description' => 'Core platform and architecture team.',
                'lead_employee_id' => $engineeringLead->id,
            ],
        );

        $peopleTeam = Team::query()->updateOrCreate(
            ['code' => 'HR-BP'],
            [
                'department_id' => $hr->id,
                'name' => 'People Business Partner',
                'description' => 'HRBP and workforce planning team.',
                'lead_employee_id' => $hrPartner->id,
            ],
        );

        $engineeringLead->forceFill(['team_id' => $platformTeam->id])->save();
        $backendEngineer->forceFill(['team_id' => $platformTeam->id])->save();
        $hrPartner->forceFill(['team_id' => $peopleTeam->id])->save();
    }
}
