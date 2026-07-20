<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RBAC\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\AccessControl\Infrastructure\Persistence\Models\Permission;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Tests\TestCase;

class EnterpriseSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_responses_include_secure_headers(): void
    {
        $response = $this->getJson('/api/v1/auth/captcha');

        $response
            ->assertOk()
            ->assertHeader('Content-Security-Policy')
            ->assertHeader('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-XSS-Protection', '1; mode=block');
    }

    public function test_login_is_rate_limited_after_repeated_attempts(): void
    {
        config()->set('security.rate_limits.auth.login_per_minute', 2);
        $this->seed(RbacSeeder::class);

        $user = User::factory()->create([
            'email' => 'rate.limit@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $role = Role::query()->where('name', 'employee')->firstOrFail();
        $user->roles()->sync([$role->id]);

        foreach ([1, 2] as $_) {
            $captcha = $this->captcha();

            $this->postJson('/api/v1/auth/login', [
                'email' => $user->email,
                'password' => 'invalid-password',
                'captcha_id' => $captcha['captcha_id'],
                'captcha_answer' => $captcha['test_answer'],
            ])->assertStatus(422);
        }

        $captcha = $this->captcha();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'invalid-password',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ])->assertStatus(429);
    }

    public function test_access_control_overview_accepts_any_of_multiple_permissions(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->getJson('/api/v1/access-control', $this->authenticateEmail('nara.support@enterprise-hris.local'));

        $response
            ->assertOk()
            ->assertJsonPath('data.can_manage_roles', false)
            ->assertJsonPath('data.can_manage_users', true);
    }

    public function test_role_permission_sync_requires_super_admin_role_even_if_permission_is_granted(): void
    {
        $this->seed(DatabaseSeeder::class);

        $hrManagerRole = Role::query()->where('name', 'hr-manager')->firstOrFail();
        $rolesManagePermission = Permission::query()->where('code', 'roles.manage')->firstOrFail();
        $hrManagerRole->permissions()->syncWithoutDetaching([$rolesManagePermission->id]);

        $targetRole = Role::query()->where('name', 'employee')->firstOrFail();
        $permissions = Permission::query()->where('code', 'dashboard.view')->pluck('id')->all();

        $this->putJson(
            "/api/v1/access-control/roles/{$targetRole->id}/permissions",
            ['permission_ids' => $permissions],
            $this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        )->assertForbidden();
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
