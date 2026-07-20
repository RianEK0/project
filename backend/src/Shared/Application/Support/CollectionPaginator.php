<?php

namespace Shared\Application\Support;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

final class CollectionPaginator
{
    /**
     * @template TKey of array-key
     * @template TValue
     *
     * @param  Collection<TKey, TValue>  $items
     * @return LengthAwarePaginator<int, TValue>
     */
    public static function paginate(Collection $items, ListQueryOptions $query): LengthAwarePaginator
    {
        $sliced = $items
            ->forPage($query->page, $query->perPage)
            ->values();

        return new LengthAwarePaginator(
            items: $sliced,
            total: $items->count(),
            perPage: $query->perPage,
            currentPage: $query->page,
            options: [
                'path' => LengthAwarePaginator::resolveCurrentPath(),
                'pageName' => 'page',
            ],
        );
    }
}
