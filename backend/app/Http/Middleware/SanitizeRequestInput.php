<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeRequestInput
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->query->replace($this->sanitizeArray($request->query->all()));

        if ($request->isJson()) {
            $request->json()->replace($this->sanitizeArray($request->json()->all()));
        } else {
            $request->request->replace($this->sanitizeArray($request->request->all()));
        }

        return $next($request);
    }

    /**
     * @param  array<string|int, mixed>  $payload
     * @return array<string|int, mixed>
     */
    private function sanitizeArray(array $payload): array
    {
        foreach ($payload as $key => $value) {
            if (is_array($value)) {
                $payload[$key] = $this->sanitizeArray($value);
                continue;
            }

            if (is_string($value)) {
                $payload[$key] = $this->sanitizeString($value);
            }
        }

        return $payload;
    }

    private function sanitizeString(string $value): string
    {
        return preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value) ?? $value;
    }
}
