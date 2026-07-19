<?php

namespace Database\Seeders;

use Database\Seeders\RBAC\AdminUserSeeder;
use Database\Seeders\RBAC\DemoAccountSeeder;
use Database\Seeders\RBAC\RbacSeeder;
use Database\Seeders\Leave\LeaveSeeder;
use Database\Seeders\Organization\OrganizationSeeder;
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
        ]);
    }
}
