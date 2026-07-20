<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\TwoFactorConfirmRequest;
use App\Http\Requests\Auth\TwoFactorDisableRequest;
use App\Http\Requests\Auth\TwoFactorLoginRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use App\Http\Resources\Auth\AuthSessionResource;
use App\Http\Resources\Auth\LoginHistoryResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Modules\AccessControl\Application\DTO\LoginData;
use Modules\AccessControl\Application\Services\AuthService;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
    }

    public function captcha(): JsonResponse
    {
        return ApiResponse::success(
            $this->authService->issueCaptcha(),
            'CAPTCHA generated successfully.'
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $payload = $this->authService->login(LoginData::fromArray($request->validated()), $request);

        if (($payload['requires_two_factor'] ?? false) === true) {
            return ApiResponse::success($payload, 'Two factor verification required.', 202);
        }

        return ApiResponse::success([
            'access_token' => $payload['access_token'],
            'refresh_token' => $payload['refresh_token'],
            'token_type' => $payload['token_type'],
            'expires_in' => $payload['expires_in'],
            'refresh_expires_at' => $payload['refresh_expires_at'],
            'remember' => $payload['remember'],
            'user' => new AuthenticatedUserResource($payload['user']),
            'session' => new AuthSessionResource($payload['session']),
        ], 'Authentication successful.');
    }

    public function verifyTwoFactorLogin(TwoFactorLoginRequest $request): JsonResponse
    {
        $payload = $this->authService->verifyTwoFactorLogin($request->validated(), $request);

        return ApiResponse::success([
            'access_token' => $payload['access_token'],
            'refresh_token' => $payload['refresh_token'],
            'token_type' => $payload['token_type'],
            'expires_in' => $payload['expires_in'],
            'refresh_expires_at' => $payload['refresh_expires_at'],
            'remember' => $payload['remember'],
            'user' => new AuthenticatedUserResource($payload['user']),
            'session' => new AuthSessionResource($payload['session']),
        ], 'Authentication successful.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new AuthenticatedUserResource($request->user('api')->loadMissing('roles.permissions', 'employee.department'))
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request);

        return ApiResponse::success(null, 'Session closed successfully.');
    }

    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $payload = $this->authService->refresh($request->validated()['refresh_token'], $request);

        return ApiResponse::success([
            'access_token' => $payload['access_token'],
            'refresh_token' => $payload['refresh_token'],
            'token_type' => $payload['token_type'],
            'expires_in' => $payload['expires_in'],
            'refresh_expires_at' => $payload['refresh_expires_at'],
            'remember' => $payload['remember'],
            'user' => new AuthenticatedUserResource($payload['user']),
            'session' => new AuthSessionResource($payload['session']),
        ], 'Token refreshed successfully.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendResetLink(
            $request->validated('email'),
            $request->validated('captcha_id'),
            $request->validated('captcha_answer'),
        );

        return ApiResponse::success(
            null,
            'Jika email terdaftar, tautan reset password telah dikirim.'
        );
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword($request->validated());

        return ApiResponse::success(null, 'Password berhasil diperbarui. Silakan masuk kembali.');
    }

    public function sendVerificationNotification(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        $this->authService->sendEmailVerification($user);

        return ApiResponse::success(null, 'Tautan verifikasi email telah dikirim.');
    }

    public function verifyEmail(Request $request, int $id, string $hash): RedirectResponse
    {
        abort_unless(URL::hasValidSignature($request), 403);

        /** @var User $user */
        $user = User::query()->findOrFail($id);
        abort_unless(hash_equals(sha1($user->getEmailForVerification()), $hash), 403);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        $target = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/').'/login?verified=1';

        return redirect()->away($target);
    }

    public function sessions(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['remember', 'current'],
            allowedSorts: ['default', 'last_seen_at', 'expires_at', 'created_at'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $sessions = $this->authService->sessions(
            $user,
            $this->authService->currentSession($request),
            $query,
        );

        return ApiResponse::paginated(
            $sessions,
            AuthSessionResource::collection($sessions->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function revokeSession(Request $request, string $sessionId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');
        $payload = $this->authService->revokeUserSession(
            $user,
            $sessionId,
            $this->authService->currentSession($request)
        );

        return ApiResponse::success($payload, 'Session revoked successfully.');
    }

    public function revokeOtherSessions(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');
        $currentSession = $this->authService->currentSession($request);

        return ApiResponse::success([
            'revoked_sessions' => $currentSession
                ? $this->authService->revokeOtherSessions($user, $currentSession->id)
                : 0,
        ], 'Other sessions revoked successfully.');
    }

    public function loginHistory(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['successful', 'two_factor_passed'],
            allowedSorts: ['default', 'attempted_at', 'successful'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $history = $this->authService->loginHistory($user, $query);

        return ApiResponse::paginated(
            $history,
            LoginHistoryResource::collection($history->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function beginTwoFactorSetup(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        return ApiResponse::success(
            $this->authService->beginTwoFactorSetup($user),
            'Two factor setup started.'
        );
    }

    public function confirmTwoFactorSetup(TwoFactorConfirmRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        return ApiResponse::success([
            'recovery_codes' => $this->authService->confirmTwoFactorSetup($user, $request->validated('code')),
        ], 'Two factor authentication enabled.');
    }

    public function disableTwoFactor(TwoFactorDisableRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        $this->authService->disableTwoFactor(
            $user,
            $request->validated('password'),
            $request->validated('code'),
            $request->validated('recovery_code'),
        );

        return ApiResponse::success(null, 'Two factor authentication disabled.');
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user('api');

        return ApiResponse::success(
            $this->authService->changePassword(
                $user,
                $request->validated('current_password'),
                $request->validated('password'),
            ),
            'Password updated successfully. Please sign in again.'
        );
    }
}
