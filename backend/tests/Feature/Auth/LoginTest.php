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

        $administratorRole = Role::query()->where('name', 'super-admin')->firstOrFail();
        $user->roles()->sync([$administratorRole->id]);

        $captcha = $this->captcha();
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'hr.admin@example.com',
            'password' => 'Password123!',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.token_type', 'bearer')
            ->assertJsonStructure([
                'message',
                'data' => [
                    'access_token',
                    'refresh_token',
                    'token_type',
                    'expires_in',
                    'refresh_expires_at',
                    'remember',
                    'session' => [
                        'id',
                        'expires_at',
                    ],
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'email_verified_at',
                        'two_factor_enabled',
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

        $captcha = $this->captcha();
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ]);

        $response->assertStatus(422);
    }

    /**
     * @return array<string, mixed>
     */
    private function captcha(): array
    {
        $response = $this->getJson('/api/v1/auth/captcha');

        $response->assertOk();

        return $response->json('data');
    }
}
