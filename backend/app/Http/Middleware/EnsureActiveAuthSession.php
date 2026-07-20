<?php

namespace App\Http\Middleware;

use App\Models\AuthSession;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use Symfony\Component\HttpFoundation\Response;

class EnsureActiveAuthSession
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $payload = auth('api')->payload();
        } catch (JWTException) {
            return $this->unauthorizedResponse();
        }

        $sessionId = $payload->get('sid');
        $userId = $payload->get('sub');

        if (! is_string($sessionId) || $sessionId === '') {
            return $this->unauthorizedResponse();
        }

        $session = AuthSession::query()
            ->active()
            ->where('id', $sessionId)
            ->where('user_id', $userId)
            ->first();

        if (! $session) {
            return $this->unauthorizedResponse();
        }

        $session->forceFill([
            'last_seen_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ])->save();

        $request->attributes->set('auth_session', $session);

        return $next($request);
    }

    private function unauthorizedResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Sesi Anda sudah tidak aktif. Silakan masuk kembali.',
            'data' => null,
        ], 401);
    }
}
