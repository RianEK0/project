<?php

namespace Shared\Application\Support;

use Illuminate\Http\Request;

final class ListQueryOptions
{
    /**
     * @param  array<string, mixed>  $filters
     * @param  list<string>  $allowedSorts
     */
    public function __construct(
        public readonly int $page,
        public readonly int $perPage,
        public readonly ?string $search,
        public readonly string $sortBy,
        public readonly string $sortDirection,
        public readonly array $filters = [],
        public readonly array $allowedSorts = [],
    ) {
    }

    /**
     * @param  list<string>  $allowedFilters
     * @param  list<string>  $allowedSorts
     */
    public static function fromRequest(
        Request $request,
        array $allowedFilters = [],
        array $allowedSorts = ['default'],
        string $defaultSortBy = 'default',
        string $defaultSortDirection = 'asc',
        int $defaultPerPage = 15,
        int $maxPerPage = 100,
    ): self {
        $filters = [];

        foreach ($allowedFilters as $filterKey) {
            if ($request->has($filterKey)) {
                $filters[$filterKey] = $request->input($filterKey);
            }
        }

        $requestedSortBy = trim($request->string('sort_by')->toString());
        $requestedSortDirection = strtolower(trim($request->string('sort_direction')->toString()));
        $sortBy = in_array($requestedSortBy, $allowedSorts, true) ? $requestedSortBy : $defaultSortBy;
        $sortDirection = in_array($requestedSortDirection, ['asc', 'desc'], true)
            ? $requestedSortDirection
            : (strtolower($defaultSortDirection) === 'desc' ? 'desc' : 'asc');

        $perPage = max(1, min($request->integer('per_page', $defaultPerPage), $maxPerPage));
        $page = max(1, $request->integer('page', 1));
        $search = trim($request->string('search')->toString());

        return new self(
            page: $page,
            perPage: $perPage,
            search: $search !== '' ? $search : null,
            sortBy: $sortBy,
            sortDirection: $sortDirection,
            filters: $filters,
            allowedSorts: $allowedSorts,
        );
    }

    public function filter(string $key): mixed
    {
        return $this->filters[$key] ?? null;
    }

    /**
     * @return array<string, mixed>
     */
    public function meta(): array
    {
        return [
            'search' => $this->search,
            'sort' => [
                'by' => $this->sortBy,
                'direction' => $this->sortDirection,
            ],
            'filters' => array_filter(
                $this->filters,
                static fn (mixed $value): bool => $value !== null && $value !== '' && $value !== [],
            ),
        ];
    }
}
