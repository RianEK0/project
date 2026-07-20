<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user('api');

        if (! $user) {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $permissions = $this->normalizePermissions($permissions);

        if ($permissions !== [] && ! $user->hasAnyPermission($permissions)) {
            return new JsonResponse([
                'message' => 'You do not have permission to perform this action.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }

    /**
     * @param  list<string>  $permissions
     * @return list<string>
     */
    private function normalizePermissions(array $permissions): array
    {
        $normalized = [];

        foreach ($permissions as $value) {
            foreach (preg_split('/[,\|]/', $value) ?: [] as $permission) {
                $permission = trim($permission);

                if ($permission !== '') {
                    $normalized[] = $permission;
                }
            }
        }

        return array_values(array_unique($normalized));
    }
}
