<?php

namespace Shared\Application\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    /**
     * @param  array<string, mixed>  $meta
     */
    public static function success(
        mixed $data = null,
        string $message = 'Request completed successfully.',
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        $payload = [
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    public static function paginated(
        LengthAwarePaginator $paginator,
        mixed $data,
        string $message = 'Request completed successfully.',
        array $meta = [],
    ): JsonResponse {
        return self::success(
            data: $data,
            message: $message,
            status: 200,
            meta: self::paginationMeta($paginator, $meta),
        );
    }

    /**
     * @param  array<string, mixed>  $meta
     * @return array<string, mixed>
     */
    public static function paginationMeta(LengthAwarePaginator $paginator, array $meta = []): array
    {
        return array_merge([
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ], $meta);
    }
}
