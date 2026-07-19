<?php

namespace Modules\AccessControl\Application\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Application\DTO\LoginData;

class AuthService
{
    /**
     * @return array<string, mixed>
     */
    public function login(LoginData $data): array
    {
        $credentials = [
            'email' => $data->email,
            'password' => $data->password,
            'status' => 'active',
        ];

        $token = Auth::guard('api')->attempt($credentials);

        if (! $token) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        /** @var User $user */
        $user = Auth::guard('api')->user();
        $user->forceFill(['last_login_at' => now()])->save();

        return $this->buildTokenPayload($token, $user);
    }

    public function logout(): void
    {
        Auth::guard('api')->logout();
    }

    /**
     * @return array<string, mixed>
     */
    public function refresh(): array
    {
        $token = Auth::guard('api')->refresh();

        /** @var User $user */
        $user = Auth::guard('api')->user();

        return $this->buildTokenPayload($token, $user);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildTokenPayload(string $token, User $user): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => $user->loadMissing('roles.permissions', 'employee.department'),
        ];
    }
}
