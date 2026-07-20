<?php

namespace Tests\Feature\Auth;

use App\Models\AuthSession;
use App\Models\User;
use App\Notifications\Auth\VerifyEmailNotification;
use Database\Seeders\RBAC\RbacSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Modules\AccessControl\Application\Services\TotpService;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Tests\TestCase;

class AccountManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_unverified_user_is_prompted_to_verify_and_can_complete_email_verification(): void
    {
        Notification::fake();
        $this->seed(RbacSeeder::class);

        $user = $this->createUser(
            email: 'verify.user@example.com',
            verified: false,
        );
        $captcha = $this->captcha();

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Password123!',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('data.requires_email_verification', true)
            ->assertJsonPath('data.email', $user->email);

        Notification::assertSentTo($user, VerifyEmailNotification::class);

        $verificationUrl = URL::temporarySignedRoute('verification.verify', now()->addMinutes(30), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($verificationUrl)
            ->assertRedirect('http://localhost:5173/login?verified=1');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_authenticated_user_can_send_verification_notification(): void
    {
        Notification::fake();
        $this->seed(RbacSeeder::class);

        $user = $this->createUser(
            email: 'resend.verify@example.com',
            verified: false,
        );

        $this->postJson(
            '/api/v1/auth/email/verification-notification',
            [],
            $this->authenticateUser($user),
        )
            ->assertOk()
            ->assertJsonPath('message', 'Tautan verifikasi email telah dikirim.');

        Notification::assertSentTo($user, VerifyEmailNotification::class);
    }

    public function test_authenticated_user_can_setup_confirm_and_disable_two_factor(): void
    {
        $this->seed(RbacSeeder::class);

        $user = $this->createUser();
        $headers = $this->authenticateUser($user);

        $setupResponse = $this->postJson('/api/v1/auth/two-factor/setup', [], $headers);

        $setupResponse
            ->assertOk()
            ->assertJsonPath('message', 'Two factor setup started.');

        $secret = $setupResponse->json('data.secret');

        $confirmResponse = $this->postJson('/api/v1/auth/two-factor/confirm', [
            'code' => app(TotpService::class)->currentCode($secret),
        ], $headers);

        $confirmResponse
            ->assertOk()
            ->assertJsonCount((int) config('security.two_factor.recovery_codes'), 'data.recovery_codes');

        $this->assertTrue($user->fresh()->hasTwoFactorEnabled());

        $this->deleteJson('/api/v1/auth/two-factor', [
            'password' => 'Password123!',
            'recovery_code' => $confirmResponse->json('data.recovery_codes.0'),
        ], $headers)
            ->assertOk()
            ->assertJsonPath('message', 'Two factor authentication disabled.');

        $this->assertFalse($user->fresh()->hasTwoFactorEnabled());
    }

    public function test_user_can_revoke_other_sessions_and_change_password(): void
    {
        $this->seed(RbacSeeder::class);

        $user = $this->createUser(email: 'password.owner@example.com');
        $primaryHeaders = $this->authenticateUser($user);
        $secondaryHeaders = $this->authenticateUser($user, remember: true);

        $this->getJson('/api/v1/auth/sessions', $secondaryHeaders)
            ->assertOk()
            ->assertJsonPath('meta.total', 2);

        $this->deleteJson('/api/v1/auth/sessions/others', [], $secondaryHeaders)
            ->assertOk()
            ->assertJsonPath('data.revoked_sessions', 1);

        $this->assertSame(1, AuthSession::query()->active()->where('user_id', $user->id)->count());
        $this->getJson('/api/v1/auth/me', $secondaryHeaders)->assertOk();

        $this->postJson('/api/v1/auth/change-password', [
            'current_password' => 'Password123!',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ], $secondaryHeaders)
            ->assertOk()
            ->assertJsonPath('data.signed_out', true);

        $this->assertSame(0, AuthSession::query()->active()->where('user_id', $user->id)->count());

        $captcha = $this->captcha();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'captcha_id' => $captcha['captcha_id'],
            'captcha_answer' => $captcha['test_answer'],
        ])->assertOk();
    }

    public function test_logout_revokes_current_session(): void
    {
        $this->seed(RbacSeeder::class);

        $user = $this->createUser(email: 'logout.user@example.com');
        $headers = $this->authenticateUser($user);

        $this->postJson('/api/v1/auth/logout', [], $headers)
            ->assertOk()
            ->assertJsonPath('message', 'Session closed successfully.');

        $this->getJson('/api/v1/auth/me', $headers)->assertUnauthorized();
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

    private function createUser(
        string $email = 'account.owner@example.com',
        bool $verified = true,
    ): User {
        $user = User::factory()->create([
            'name' => 'Account Owner',
            'email' => $email,
            'password' => 'Password123!',
            'status' => 'active',
            'email_verified_at' => $verified ? now() : null,
        ]);

        $employeeRole = Role::query()->where('name', 'employee')->firstOrFail();
        $user->roles()->sync([$employeeRole->id]);

        return $user;
    }
}
