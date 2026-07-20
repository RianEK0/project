<?php

namespace Database\Seeders\Leave;

use Illuminate\Database\Seeder;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveBalance;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class LeaveSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'code' => 'ANNUAL',
                'name' => 'Annual Leave',
                'description' => 'Standard annual leave allocation.',
                'default_days' => 12,
                'deducts_balance' => true,
                'count_weekends' => false,
                'count_holidays' => false,
                'color' => '#1d4ed8',
            ],
            [
                'code' => 'SICK',
                'name' => 'Sick Leave',
                'description' => 'Medical or health related leave.',
                'default_days' => 12,
                'deducts_balance' => true,
                'count_weekends' => false,
                'count_holidays' => false,
                'color' => '#dc2626',
                'requires_attachment' => true,
            ],
            [
                'code' => 'MARRIAGE',
                'name' => 'Marriage Leave',
                'description' => 'Marriage-related personal leave.',
                'default_days' => 3,
                'deducts_balance' => true,
                'count_weekends' => false,
                'count_holidays' => false,
                'color' => '#c026d3',
            ],
            [
                'code' => 'MATERNITY',
                'name' => 'Maternity Leave',
                'description' => 'Extended maternity leave allocation.',
                'default_days' => 90,
                'deducts_balance' => true,
                'count_weekends' => true,
                'count_holidays' => true,
                'color' => '#ea580c',
            ],
            [
                'code' => 'SPECIAL',
                'name' => 'Special Leave',
                'description' => 'Special purpose leave for exceptional events.',
                'default_days' => 5,
                'deducts_balance' => true,
                'count_weekends' => false,
                'count_holidays' => false,
                'color' => '#0f766e',
            ],
            [
                'code' => 'UNPAID',
                'name' => 'Unpaid Leave',
                'description' => 'Leave without paid balance deduction.',
                'default_days' => 0,
                'deducts_balance' => false,
                'count_weekends' => true,
                'count_holidays' => true,
                'color' => '#475569',
            ],
        ];

        foreach ($types as $type) {
            LeaveType::query()->updateOrCreate(
                ['code' => $type['code']],
                $type + ['is_active' => true],
            );
        }

        $year = (int) now()->year;
        $employees = Employee::query()->get();
        $balanceTypes = LeaveType::query()
            ->where('is_active', true)
            ->where('deducts_balance', true)
            ->get();

        foreach ($employees as $employee) {
            foreach ($balanceTypes as $leaveType) {
                LeaveBalance::query()->updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'leave_type_id' => $leaveType->id,
                        'year' => $year,
                    ],
                    [
                        'allocated_days' => $leaveType->default_days,
                        'carried_over_days' => $leaveType->code === 'ANNUAL' ? 2 : 0,
                        'used_days' => 0,
                        'pending_days' => 0,
                        'adjustment_days' => 0,
                    ],
                );
            }
        }
    }
}
