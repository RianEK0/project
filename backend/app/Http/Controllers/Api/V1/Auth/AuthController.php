<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\AuthenticatedUserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\AccessControl\Application\DTO\LoginData;
use Modules\AccessControl\Application\Services\AuthService;
use Shared\Application\Support\ApiResponse;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService,
    ) {
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $payload = $this->authService->login(LoginData::fromArray($request->validated()));

        return ApiResponse::success([
            'access_token' => $payload['access_token'],
            'token_type' => $payload['token_type'],
            'expires_in' => $payload['expires_in'],
            'user' => new AuthenticatedUserResource($payload['user']),
        ], 'Authentication successful.');
    }

    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            new AuthenticatedUserResource($request->user('api')->loadMissing('roles.permissions', 'employee.department'))
        );
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return ApiResponse::success(null, 'Session closed successfully.');
    }

    public function refresh(): JsonResponse
    {
        $payload = $this->authService->refresh();

        return ApiResponse::success([
            'access_token' => $payload['access_token'],
            'token_type' => $payload['token_type'],
            'expires_in' => $payload['expires_in'],
            'user' => new AuthenticatedUserResource($payload['user']),
        ], 'Token refreshed successfully.');
    }
}
