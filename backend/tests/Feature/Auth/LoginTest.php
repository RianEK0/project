<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RBAC\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_user_can_authenticate_with_jwt(): void
    {
        $this->seed(RbacSeeder::class);

        $user = User::factory()->create([
            'name' => 'HR Admin',
            'email' => 'hr.admin@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $administratorRole = Role::query()->where('name', 'administrator')->firstOrFail();
        $user->roles()->sync([$administratorRole->id]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'hr.admin@example.com',
            'password' => 'Password123!',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.token_type', 'bearer')
            ->assertJsonStructure([
                'message',
                'data' => [
                    'access_token',
                    'token_type',
                    'expires_in',
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'roles',
                        'permissions',
                    ],
                ],
            ]);
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $user = User::factory()->create([
            'email' => 'ops.lead@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }
}
