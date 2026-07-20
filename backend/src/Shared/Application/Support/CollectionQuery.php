<?php

namespace Shared\Application\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Str;

final class CollectionQuery
{
    /**
     * @template TKey of array-key
     * @template TValue
     *
     * @param  Collection<TKey, TValue>  $items
     * @param  callable(TValue): string|int|float|bool|null|array<int, string|int|float|bool|null>  $resolver
     * @return Collection<int, TValue>
     */
    public static function search(Collection $items, ?string $search, callable $resolver): Collection
    {
        if ($search === null) {
            return $items->values();
        }

        $needle = Str::lower($search);

        return $items
            ->filter(function (mixed $item) use ($needle, $resolver): bool {
                $values = $resolver($item);

                foreach (is_array($values) ? $values : [$values] as $value) {
                    if ($value !== null && str_contains(Str::lower((string) $value), $needle)) {
                        return true;
                    }
                }

                return false;
            })
            ->values();
    }

    /**
     * @template TKey of array-key
     * @template TValue
     *
     * @param  Collection<TKey, TValue>  $items
     * @param  callable(TValue, string): mixed  $resolver
     * @return Collection<int, TValue>
     */
    public static function sort(Collection $items, ListQueryOptions $query, callable $resolver): Collection
    {
        if ($query->sortBy === 'default') {
            return $items->values();
        }

        return $items
            ->sortBy(
                fn (mixed $item): mixed => $resolver($item, $query->sortBy),
                SORT_NATURAL,
                $query->sortDirection === 'desc',
            )
            ->values();
    }
}
