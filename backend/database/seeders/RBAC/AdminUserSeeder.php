<?php

namespace Database\Seeders\RBAC;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'admin@enterprise-hris.local'],
            [
                'name' => 'System Administrator',
                'password' => 'Password123!',
                'status' => 'active',
            ],
        );

        $role = Role::query()->where('name', 'administrator')->firstOrFail();
        $user->roles()->syncWithoutDetaching([$role->id]);
    }
}
