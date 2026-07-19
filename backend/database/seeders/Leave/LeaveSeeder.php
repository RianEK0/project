<?php

namespace Database\Seeders\Leave;

use Illuminate\Database\Seeder;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;

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
            ],
            [
                'code' => 'SICK',
                'name' => 'Sick Leave',
                'description' => 'Medical or health related leave.',
                'default_days' => 10,
                'requires_attachment' => true,
            ],
            [
                'code' => 'UNPAID',
                'name' => 'Unpaid Leave',
                'description' => 'Leave without salary deduction support yet.',
                'default_days' => 30,
            ],
        ];

        foreach ($types as $type) {
            LeaveType::query()->updateOrCreate(
                ['code' => $type['code']],
                $type + ['is_active' => true],
            );
        }
    }
}
