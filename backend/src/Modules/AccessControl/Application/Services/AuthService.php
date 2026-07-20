<?php

namespace Modules\AccessControl\Application\Services;

use App\Models\AuthRefreshToken;
use App\Models\AuthSession;
use App\Models\LoginHistory;
use App\Models\PasswordHistory;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Application\DTO\LoginData;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AuthService
{
    private const LOGIN_CHALLENGE_PREFIX = 'auth:2fa-login:';
    private const TWO_FACTOR_SETUP_PREFIX = 'auth:2fa-setup:';

    public function __construct(
        private readonly AuthCaptchaService $captchaService,
        private readonly TotpService $totpService,
    ) {
    }

    public function issueCaptcha(): array
    {
        return $this->captchaService->issue();
    }

    /**
     * @return array<string, mixed>
     */
    public function login(LoginData $data, Request $request): array
    {
        $this->captchaService->assertValid($data->captchaId, $data->captchaAnswer);

        $email = Str::lower(trim($data->email));
        $user = User::query()->where('email', $email)->first();

        $this->assertNotLocked($user);

        if (! $user || ! Hash::check($data->password, $user->password) || $user->status !== 'active') {
            if ($user) {
                $this->registerFailedAttempt($user);
            }

            $this->recordLoginAttempt($user, $email, $request, false, 'invalid_credentials');

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
            $this->recordLoginAttempt($user, $email, $request, false, 'email_unverified');

            throw new HttpResponseException(response()->json([
                'message' => 'Email belum diverifikasi. Tautan verifikasi baru telah dikirim.',
                'data' => [
                    'requires_email_verification' => true,
                    'email' => $user->email,
                ],
            ], 403));
        }

        if ($user->hasTwoFactorEnabled()) {
            $challengeId = (string) Str::ulid();

            Cache::put($this->loginChallengeKey($challengeId), [
                'user_id' => $user->id,
                'remember' => $data->remember,
                'device_name' => $data->deviceName,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ], now()->addMinutes(10));

            return [
                'requires_two_factor' => true,
                'challenge_id' => $challengeId,
                'recovery_code_allowed' => true,
            ];
        }

        return $this->completeLogin($user, $request, $data->remember, $data->deviceName, false);
    }

    /**
     * @param  array{challenge_id: string, code?: string|null, recovery_code?: string|null}  $payload
     * @return array<string, mixed>
     */
    public function verifyTwoFactorLogin(array $payload, Request $request): array
    {
        $challenge = Cache::get($this->loginChallengeKey($payload['challenge_id']));

        if (! is_array($challenge) || ! isset($challenge['user_id'])) {
            throw ValidationException::withMessages([
                'challenge_id' => 'Challenge login 2FA tidak ditemukan atau sudah kedaluwarsa.',
            ]);
        }

        /** @var User $user */
        $user = User::query()->findOrFail($challenge['user_id']);

        $this->assertNotLocked($user);

        $code = $payload['code'] ?? null;
        $recoveryCode = $payload['recovery_code'] ?? null;

        if (! $this->attemptTwoFactorVerification($user, $code, $recoveryCode)) {
            $this->registerFailedAttempt($user);
            $this->recordLoginAttempt($user, $user->email, $request, false, 'two_factor_invalid');

            throw ValidationException::withMessages([
                'code' => 'Kode autentikasi tidak valid.',
            ]);
        }

        Cache::forget($this->loginChallengeKey($payload['challenge_id']));

        return $this->completeLogin(
            $user,
            $request,
            (bool) ($challenge['remember'] ?? false),
            $challenge['device_name'] ?? null,
            true,
        );
    }

    public function logout(Request $request): void
    {
        $session = $this->currentSession($request);

        if ($session) {
            $this->revokeSession($session, 'logout');
        }

        try {
            Auth::guard('api')->logout();
        } catch (AuthenticationException) {
            //
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function refresh(string $refreshToken, Request $request): array
    {
        $hashedToken = hash('sha256', $refreshToken);
        /** @var AuthRefreshToken|null $storedToken */
        $storedToken = AuthRefreshToken::query()
            ->with('authSession.user.roles.permissions', 'authSession.user.employee.department')
            ->where('token_hash', $hashedToken)
            ->first();

        if (! $storedToken) {
            throw ValidationException::withMessages([
                'refresh_token' => 'Refresh token tidak valid.',
            ]);
        }

        $session = $storedToken->authSession;
        $user = $session?->user;

        if (! $session || ! $user || $session->revoked_at !== null || $session->expires_at->isPast()) {
            throw ValidationException::withMessages([
                'refresh_token' => 'Refresh token sudah tidak aktif.',
            ]);
        }

        if ($storedToken->revoked_at !== null || $storedToken->expires_at->isPast()) {
            if ($storedToken->revoked_reason === 'rotated') {
                $this->revokeSession($session, 'refresh_token_reuse');
            }

            throw ValidationException::withMessages([
                'refresh_token' => 'Refresh token sudah kedaluwarsa atau telah diganti.',
            ]);
        }

        $this->assertNotLocked($user);

        return DB::transaction(function () use ($storedToken, $session, $user, $request): array {
            $storedToken->forceFill([
                'last_used_at' => now(),
                'revoked_at' => now(),
                'revoked_reason' => 'rotated',
            ])->save();

            $newRefreshToken = $this->createRefreshToken($session, $storedToken);
            $accessToken = $this->createAccessToken($user, $session);

            $session->forceFill([
                'last_seen_at' => now(),
                'last_refreshed_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ])->save();

            $storedToken->forceFill([
                'replaced_by_token_id' => $newRefreshToken['model']->id,
            ])->save();

            return $this->buildTokenPayload($accessToken, $newRefreshToken['plain'], $newRefreshToken['model'], $user, $session);
        });
    }

    public function sendResetLink(string $email, string $captchaId, string $captchaAnswer): void
    {
        $this->captchaService->assertValid($captchaId, $captchaAnswer);
        $normalizedEmail = Str::lower(trim($email));

        PasswordBroker::sendResetLink([
            'email' => $normalizedEmail,
        ]);
    }

    /**
     * @param  array{email: string, token: string, password: string}  $payload
     */
    public function resetPassword(array $payload): void
    {
        $normalizedEmail = Str::lower(trim($payload['email']));
        $user = User::query()->where('email', $normalizedEmail)->first();

        if ($user) {
            $this->ensurePasswordIsAllowed($user, $payload['password']);
        }

        $status = PasswordBroker::reset([
            'email' => $normalizedEmail,
            'token' => $payload['token'],
            'password' => $payload['password'],
            'password_confirmation' => $payload['password'],
        ], function (User $user, string $password): void {
            DB::transaction(function () use ($user, $password): void {
                $this->persistPassword($user, $password);
                $this->revokeAllSessions($user, 'password_reset');
            });
        });

        if ($status !== PasswordBroker::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => __($status),
            ]);
        }
    }

    public function sendEmailVerification(User $user): void
    {
        if (! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }
    }

    public function sessions(User $user, ?AuthSession $currentSession, ListQueryOptions $query): LengthAwarePaginator
    {
        $sessions = $user->authSessions()
            ->active()
            ->when(
                filled($query->filter('remember')),
                static fn (Builder $builder) => $builder->where('remember', filter_var($query->filter('remember'), FILTER_VALIDATE_BOOLEAN)),
            )
            ->when(
                filled($query->filter('current')),
                function (Builder $builder) use ($currentSession, $query): void {
                    $currentOnly = filter_var($query->filter('current'), FILTER_VALIDATE_BOOLEAN);

                    if ($currentOnly) {
                        if ($currentSession) {
                            $builder->whereKey($currentSession->id);

                            return;
                        }

                        $builder->whereRaw('1 = 0');

                        return;
                    }

                    if ($currentSession) {
                        $builder->where('id', '!=', $currentSession->id);
                    }
                },
            )
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('device_name', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('user_agent', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByDesc('last_seen_at')
                    ->orderByDesc('created_at')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'expires_at' => $builder->orderBy('expires_at', $query->sortDirection)->orderBy('id', $query->sortDirection),
                    'created_at' => $builder->orderBy('created_at', $query->sortDirection)->orderBy('id', $query->sortDirection),
                    default => $builder->orderBy('last_seen_at', $query->sortDirection)->orderBy('id', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);

        $sessions->getCollection()->each(function (AuthSession $session) use ($currentSession): void {
            $session->setAttribute('is_current', $currentSession?->id === $session->id);
        });

        return $sessions;
    }

    public function loginHistory(User $user, ListQueryOptions $query): LengthAwarePaginator
    {
        return $user->loginHistories()
            ->when(
                filled($query->filter('successful')),
                static fn (Builder $builder) => $builder->where('successful', filter_var($query->filter('successful'), FILTER_VALIDATE_BOOLEAN)),
            )
            ->when(
                filled($query->filter('two_factor_passed')),
                static fn (Builder $builder) => $builder->where('two_factor_passed', filter_var($query->filter('two_factor_passed'), FILTER_VALIDATE_BOOLEAN)),
            )
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('email', 'like', "%{$search}%")
                        ->orWhere('device_name', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('user_agent', 'like', "%{$search}%")
                        ->orWhere('failure_reason', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByDesc('attempted_at')
                    ->orderByDesc('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'successful' => $builder->orderBy('successful', $query->sortDirection)->orderByDesc('attempted_at'),
                    default => $builder->orderBy('attempted_at', $query->sortDirection)->orderBy('id', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    /**
     * @return array{signed_out: bool}
     */
    public function revokeUserSession(User $user, string $sessionId, ?AuthSession $currentSession): array
    {
        /** @var AuthSession $session */
        $session = $user->authSessions()
            ->whereKey($sessionId)
            ->firstOrFail();

        $this->revokeSession($session, 'session_revoked');

        return [
            'signed_out' => $currentSession?->id === $session->id,
        ];
    }

    public function revokeOtherSessions(User $user, string $currentSessionId): int
    {
        $sessions = $user->authSessions()
            ->active()
            ->whereKeyNot($currentSessionId)
            ->get();

        foreach ($sessions as $session) {
            $this->revokeSession($session, 'logout_other_devices');
        }

        return $sessions->count();
    }

    public function beginTwoFactorSetup(User $user): array
    {
        if ($user->hasTwoFactorEnabled()) {
            throw new HttpResponseException(response()->json([
                'message' => 'Two factor authentication sudah aktif.',
                'data' => null,
            ], 409));
        }

        $secret = $this->totpService->generateSecret();

        Cache::put($this->twoFactorSetupKey($user), $secret, now()->addMinutes(10));

        return [
            'secret' => $secret,
            'otpauth_uri' => $this->totpService->provisioningUri($secret, $user->email),
            'expires_at' => now()->addMinutes(10)->toIso8601String(),
        ];
    }

    /**
     * @return list<string>
     */
    public function confirmTwoFactorSetup(User $user, string $code): array
    {
        $secret = Cache::get($this->twoFactorSetupKey($user));

        if (! is_string($secret) || $secret === '') {
            throw ValidationException::withMessages([
                'code' => 'Setup 2FA tidak ditemukan atau sudah kedaluwarsa.',
            ]);
        }

        if (! $this->totpService->verifyCode($secret, $code)) {
            throw ValidationException::withMessages([
                'code' => 'Kode autentikasi tidak valid.',
            ]);
        }

        $recoveryCodes = $this->totpService->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => array_map(
                static fn (string $value): string => Hash::make($value),
                $recoveryCodes,
            ),
            'two_factor_confirmed_at' => now(),
        ])->save();

        Cache::forget($this->twoFactorSetupKey($user));

        return $recoveryCodes;
    }

    public function disableTwoFactor(User $user, string $password, ?string $code, ?string $recoveryCode): void
    {
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'Password saat ini tidak cocok.',
            ]);
        }

        if (! $user->hasTwoFactorEnabled()) {
            return;
        }

        if (! $this->attemptTwoFactorVerification($user, $code, $recoveryCode)) {
            throw ValidationException::withMessages([
                'code' => 'Kode autentikasi tidak valid.',
            ]);
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }

    /**
     * @return array{signed_out: bool}
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): array
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Password saat ini tidak cocok.',
            ]);
        }

        $this->ensurePasswordIsAllowed($user, $newPassword);

        DB::transaction(function () use ($user, $newPassword): void {
            $this->persistPassword($user, $newPassword);
            $this->revokeAllSessions($user, 'password_changed');
        });

        return [
            'signed_out' => true,
        ];
    }

    public function currentSession(Request $request): ?AuthSession
    {
        $session = $request->attributes->get('auth_session');

        return $session instanceof AuthSession ? $session : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function completeLogin(
        User $user,
        Request $request,
        bool $remember,
        ?string $deviceName,
        bool $twoFactorPassed,
    ): array {
        return DB::transaction(function () use ($user, $request, $remember, $deviceName, $twoFactorPassed): array {
            $this->resetLoginFailures($user);

            $session = AuthSession::query()->create([
                'id' => (string) Str::ulid(),
                'user_id' => $user->id,
                'device_name' => $deviceName,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'remember' => $remember,
                'context' => [
                    'platform' => $request->header('X-Platform'),
                ],
                'last_seen_at' => now(),
                'last_refreshed_at' => now(),
                'expires_at' => $this->refreshExpiry($remember),
            ]);

            $refreshToken = $this->createRefreshToken($session);
            $accessToken = $this->createAccessToken($user, $session);

            $user->forceFill([
                'last_login_at' => now(),
            ])->save();

            $this->recordLoginAttempt($user, $user->email, $request, true, null, $session, $twoFactorPassed);

            return $this->buildTokenPayload($accessToken, $refreshToken['plain'], $refreshToken['model'], $user, $session);
        });
    }

    /**
     * @return array{plain: string, model: AuthRefreshToken}
     */
    private function createRefreshToken(AuthSession $session, ?AuthRefreshToken $rotatedFrom = null): array
    {
        $plainToken = rtrim(strtr(base64_encode(random_bytes(64)), '+/', '-_'), '=');
        $model = AuthRefreshToken::query()->create([
            'id' => (string) Str::ulid(),
            'auth_session_id' => $session->id,
            'token_hash' => hash('sha256', $plainToken),
            'expires_at' => $session->expires_at,
            'replaced_by_token_id' => null,
            'last_used_at' => $rotatedFrom?->last_used_at,
        ]);

        return [
            'plain' => $plainToken,
            'model' => $model,
        ];
    }

    private function createAccessToken(User $user, AuthSession $session): string
    {
        return Auth::guard('api')
            ->claims([
                'sid' => $session->id,
                'type' => 'access',
                'remember' => $session->remember,
            ])
            ->setTTL(config('security.access_token_ttl_minutes'))
            ->login($user);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildTokenPayload(
        string $accessToken,
        string $refreshToken,
        AuthRefreshToken $refreshTokenModel,
        User $user,
        AuthSession $session,
    ): array {
        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'bearer',
            'expires_in' => config('security.access_token_ttl_minutes') * 60,
            'refresh_expires_at' => $refreshTokenModel->expires_at?->toIso8601String(),
            'remember' => $session->remember,
            'user' => $user->loadMissing('roles.permissions', 'employee.department'),
            'session' => $session,
        ];
    }

    private function refreshExpiry(bool $remember)
    {
        return now()->addDays(
            $remember
                ? config('security.remember_refresh_token_ttl_days')
                : config('security.refresh_token_ttl_days')
        );
    }

    private function registerFailedAttempt(User $user): void
    {
        $attempts = $user->failed_login_attempts + 1;
        $maxAttempts = config('security.lockout.max_attempts');
        $lockoutUntil = $attempts >= $maxAttempts
            ? now()->addMinutes(config('security.lockout.duration_minutes'))
            : null;

        $user->forceFill([
            'failed_login_attempts' => $attempts >= $maxAttempts ? 0 : $attempts,
            'last_failed_login_at' => now(),
            'locked_until' => $lockoutUntil,
        ])->save();
    }

    private function resetLoginFailures(User $user): void
    {
        $user->forceFill([
            'failed_login_attempts' => 0,
            'last_failed_login_at' => null,
            'locked_until' => null,
        ])->save();
    }

    private function assertNotLocked(?User $user): void
    {
        if ($user?->locked_until && $user->locked_until->isFuture()) {
            throw new HttpResponseException(response()->json([
                'message' => sprintf(
                    'Akun dikunci sampai %s.',
                    $user->locked_until->setTimezone(config('app.timezone'))->format('Y-m-d H:i:s')
                ),
                'data' => [
                    'locked_until' => $user->locked_until->toIso8601String(),
                ],
            ], 423));
        }
    }

    private function recordLoginAttempt(
        ?User $user,
        string $email,
        Request $request,
        bool $successful,
        ?string $failureReason = null,
        ?AuthSession $session = null,
        bool $twoFactorPassed = false,
    ): void {
        LoginHistory::query()->create([
            'user_id' => $user?->id,
            'auth_session_id' => $session?->id,
            'email' => $email,
            'successful' => $successful,
            'two_factor_passed' => $twoFactorPassed,
            'failure_reason' => $failureReason,
            'device_name' => $session?->device_name,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'context' => null,
            'attempted_at' => now(),
        ]);
    }

    private function revokeSession(AuthSession $session, string $reason): void
    {
        DB::transaction(function () use ($session, $reason): void {
            $session->forceFill([
                'revoked_at' => now(),
                'revoked_reason' => $reason,
            ])->save();

            $session->refreshTokens()
                ->whereNull('revoked_at')
                ->update([
                    'revoked_at' => now(),
                    'revoked_reason' => $reason,
                ]);
        });
    }

    private function revokeAllSessions(User $user, string $reason): void
    {
        $sessions = $user->authSessions()->active()->get();

        foreach ($sessions as $session) {
            $this->revokeSession($session, $reason);
        }
    }

    private function ensurePasswordIsAllowed(User $user, string $password): void
    {
        $validator = Validator::make([
            'password' => $password,
        ], [
            'password' => [
                'required',
                'string',
                PasswordRule::min(12)->mixedCase()->numbers()->symbols(),
            ],
        ], [
            'password.min' => 'Password minimal 12 karakter.',
        ]);

        $validator->after(function ($validator) use ($user, $password): void {
            $normalizedPassword = Str::lower($password);
            $emailLocalPart = Str::before(Str::lower($user->email), '@');
            $normalizedName = Str::of($user->name)->lower()->replace(' ', '')->value();

            if ($emailLocalPart !== '' && str_contains($normalizedPassword, $emailLocalPart)) {
                $validator->errors()->add('password', 'Password tidak boleh mengandung email akun.');
            }

            if ($normalizedName !== '' && str_contains(Str::replace(' ', '', $normalizedPassword), $normalizedName)) {
                $validator->errors()->add('password', 'Password tidak boleh mengandung nama pengguna.');
            }

            if (Hash::check($password, $user->password)) {
                $validator->errors()->add('password', 'Password baru tidak boleh sama dengan password saat ini.');
            }

            $historyLimit = max(1, config('security.password_history_limit'));
            $reused = $user->passwordHistories()
                ->latest('created_at')
                ->limit($historyLimit)
                ->get()
                ->contains(static fn (PasswordHistory $history): bool => Hash::check($password, $history->password));

            if ($reused) {
                $validator->errors()->add('password', 'Password baru tidak boleh sama dengan riwayat password sebelumnya.');
            }
        });

        $validator->validate();
    }

    private function persistPassword(User $user, string $password): void
    {
        $user->forceFill([
            'password' => $password,
            'password_changed_at' => now(),
            'remember_token' => Str::random(60),
            'failed_login_attempts' => 0,
            'last_failed_login_at' => null,
            'locked_until' => null,
        ])->save();

        $user->passwordHistories()->create([
            'password' => $user->password,
            'created_at' => now(),
        ]);

        $historyLimit = max(1, config('security.password_history_limit'));
        $staleHistory = $user->passwordHistories()
            ->latest('created_at')
            ->skip($historyLimit)
            ->take(PHP_INT_MAX)
            ->pluck('id');

        if ($staleHistory->isNotEmpty()) {
            PasswordHistory::query()->whereKey($staleHistory)->delete();
        }
    }

    private function attemptTwoFactorVerification(User $user, ?string $code, ?string $recoveryCode): bool
    {
        if ($code && $user->two_factor_secret && $this->totpService->verifyCode($user->two_factor_secret, $code)) {
            return true;
        }

        if (! $recoveryCode) {
            return false;
        }

        $codes = $user->two_factor_recovery_codes ?? [];
        $remainingCodes = [];
        $matched = false;

        foreach ($codes as $storedCode) {
            if (! $matched && Hash::check(Str::upper($recoveryCode), $storedCode)) {
                $matched = true;
                continue;
            }

            $remainingCodes[] = $storedCode;
        }

        if ($matched) {
            $user->forceFill([
                'two_factor_recovery_codes' => $remainingCodes,
            ])->save();
        }

        return $matched;
    }

    private function loginChallengeKey(string $challengeId): string
    {
        return self::LOGIN_CHALLENGE_PREFIX.$challengeId;
    }

    private function twoFactorSetupKey(User $user): string
    {
        return self::TWO_FACTOR_SETUP_PREFIX.$user->id;
    }
}
