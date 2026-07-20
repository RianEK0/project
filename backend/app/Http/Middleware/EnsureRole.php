<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user('api');

        if (! $user) {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $roles = $this->normalizeRoles($roles);

        if ($roles === [] || $user->hasAnyRole($roles)) {
            return $next($request);
        }

        return new JsonResponse([
            'message' => 'You do not have the required role to perform this action.',
        ], Response::HTTP_FORBIDDEN);
    }

    /**
     * @param  list<string>  $roles
     * @return list<string>
     */
    private function normalizeRoles(array $roles): array
    {
        $normalized = [];

        foreach ($roles as $value) {
            foreach (preg_split('/[,\|]/', $value) ?: [] as $role) {
                $role = trim($role);

                if ($role !== '') {
                    $normalized[] = $role;
                }
            }
        }

        return array_values(array_unique($normalized));
    }
}
