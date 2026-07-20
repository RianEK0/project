<?php

namespace Database\Seeders;

use Database\Seeders\Attendance\AttendanceSeeder;
use Database\Seeders\Assets\ItAssetSeeder;
use Database\Seeders\Notifications\NotificationSeeder;
use Database\Seeders\RBAC\AdminUserSeeder;
use Database\Seeders\RBAC\DemoAccountSeeder;
use Database\Seeders\RBAC\RbacSeeder;
use Database\Seeders\Leave\LeaveSeeder;
use Database\Seeders\Organization\OrganizationSeeder;
use Database\Seeders\Payroll\PayrollSeeder;
use Database\Seeders\Performance\PerformanceSeeder;
use Database\Seeders\Recruitment\RecruitmentSeeder;
use Database\Seeders\Workforce\WorkforceSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RbacSeeder::class,
            WorkforceSeeder::class,
            OrganizationSeeder::class,
            LeaveSeeder::class,
            AdminUserSeeder::class,
            DemoAccountSeeder::class,
            AttendanceSeeder::class,
            PayrollSeeder::class,
            RecruitmentSeeder::class,
            PerformanceSeeder::class,
            ItAssetSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
