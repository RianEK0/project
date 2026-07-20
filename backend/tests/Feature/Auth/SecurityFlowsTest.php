<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\AuthSession;
use App\Notifications\Auth\ResetPasswordNotification;
use Database\Seeders\RBAC\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Modules\AccessControl\Application\Services\TotpService;
use Tests\TestCase;

class SecurityFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_two_factor_requires_second_step_and_can_be_completed(): void
    {
        $this->seed(RbacSeeder::class);

        $secret = app(TotpService::class)->generateSecret();
        $user = User::factory()->create([
            'email' => 'secure.user@example.com',
            'password' => 'Password123!',
            'status' => 'active',
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => [],
            'two_factor_confirmed_at' => now(),
        ]);

        $captcha = $this->captcha();
        $challenge = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ]);

        $challenge
            ->assertStatus(202)
            ->assertJsonPath('data.requires_two_factor', true);

        $response = $this->postJson('/api/v1/auth/login/2fa', [
            'challenge_id' => $challenge->json('data.challenge_id'),
            'code' => app(TotpService::class)->currentCode($secret),
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('data.user.two_factor_enabled', true)
            ->assertJsonStructure([
                'data' => [
                    'access_token',
                    'refresh_token',
                    'session' => ['id'],
                ],
            ]);
    }

    public function test_refresh_token_rotates_and_reuse_revokes_session(): void
    {
        $this->seed(RbacSeeder::class);

        $user = User::factory()->create([
            'email' => 'refresh.user@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $captcha = $this->captcha();
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ])->assertOk();

        $firstRefreshToken = $login->json('data.refresh_token');

        $refreshed = $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $firstRefreshToken,
        ]);

        $refreshed
            ->assertOk()
            ->assertJsonMissingPath('data.requires_two_factor');

        $secondAccessToken = $refreshed->json('data.access_token');

        $this->postJson('/api/v1/auth/refresh', [
            'refresh_token' => $firstRefreshToken,
        ])->assertStatus(422);

        $this->withHeader('Authorization', 'Bearer '.$secondAccessToken)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_revoking_current_session_blocks_further_requests(): void
    {
        $this->seed(RbacSeeder::class);

        $user = User::factory()->create([
            'email' => 'device.user@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $captcha = $this->captcha();
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ])->assertOk();

        $accessToken = $login->json('data.access_token');
        $sessionId = $login->json('data.session.id');

        $this->withHeader('Authorization', 'Bearer '.$accessToken)
            ->deleteJson('/api/v1/auth/sessions/'.$sessionId)
            ->assertOk()
            ->assertJsonPath('data.signed_out', true);

        $this->withHeader('Authorization', 'Bearer '.$accessToken)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }

    public function test_forgot_password_sends_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset.user@example.com',
            'status' => 'active',
        ]);

        $captcha = $this->captcha();

        $this->postJson('/api/v1/auth/forgot-password', [
            'email' => $user->email,
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ])->assertOk();

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_password_reset_rejects_reused_password(): void
    {
        $user = User::factory()->create([
            'email' => 'history.user@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $token = Password::broker()->createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    public function test_session_and_login_history_endpoints_support_pagination_filters_sorting_and_search(): void
    {
        $this->seed(RbacSeeder::class);

        $user = User::factory()->create([
            'email' => 'history.sessions@example.com',
            'password' => 'Password123!',
            'status' => 'active',
        ]);

        $primaryCaptcha = $this->captcha();
        $primaryLogin = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'captcha_id' => $primaryCaptcha['captcha_id'],
            'captcha_answer' => $primaryCaptcha['test_answer'],
            'device_name' => 'Primary Device',
        ])->assertOk();
        $primaryLogin->assertJsonPath('data.session.device_name', 'Primary Device');

        $secondaryCaptcha = $this->captcha();
        $secondaryLogin = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'captcha_id' => $secondaryCaptcha['captcha_id'],
            'captcha_answer' => $secondaryCaptcha['test_answer'],
            'device_name' => 'Secondary Device',
        ])->assertOk();

        $this->assertSame(2, AuthSession::query()->where('user_id', $user->id)->count());
        $secondaryLogin->assertJsonPath('data.session.device_name', 'Secondary Device');

        $accessToken = $secondaryLogin->json('data.access_token');

        $sessionsResponse = $this->withHeader('Authorization', 'Bearer '.$accessToken)
            ->getJson('/api/v1/auth/sessions?current=true&search=127.0.0.1&sort_by=created_at&sort_direction=asc&per_page=1');

        $sessionsResponse
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.search', '127.0.0.1')
            ->assertJsonPath('meta.sort.by', 'created_at')
            ->assertJsonPath('meta.sort.direction', 'asc')
            ->assertJsonPath('meta.filters.current', 'true')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.device_name', 'Secondary Device')
            ->assertJsonPath('data.0.is_current', true);

        $historyResponse = $this->withHeader('Authorization', 'Bearer '.$accessToken)
            ->getJson('/api/v1/auth/login-history?successful=true&search=Primary%20Device&sort_by=attempted_at&sort_direction=asc&per_page=1');

        $historyResponse
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.search', 'Primary Device')
            ->assertJsonPath('meta.sort.by', 'attempted_at')
            ->assertJsonPath('meta.sort.direction', 'asc')
            ->assertJsonPath('meta.filters.successful', 'true')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.device_name', 'Primary Device')
            ->assertJsonPath('data.0.successful', true);
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
