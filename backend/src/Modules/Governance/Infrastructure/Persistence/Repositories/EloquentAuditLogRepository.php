<?php

namespace Modules\Governance\Infrastructure\Persistence\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Modules\Governance\Domain\Contracts\AuditLogRepository;
use Modules\Governance\Infrastructure\Persistence\Models\AuditLog;
use Shared\Application\Support\ListQueryOptions;

class EloquentAuditLogRepository implements AuditLogRepository
{
    public function create(array $attributes): AuditLog
    {
        return AuditLog::query()->create($attributes);
    }

    public function paginate(ListQueryOptions $query): LengthAwarePaginator
    {
        return AuditLog::query()
            ->with('actor')
            ->when(
                filled($query->filter('action')),
                static fn (Builder $builder) => $builder->where('action', (string) $query->filter('action')),
            )
            ->when(
                filled($query->filter('actor_id')),
                static fn (Builder $builder) => $builder->where('actor_id', (int) $query->filter('actor_id')),
            )
            ->when(
                filled($query->filter('auditable_type')),
                static fn (Builder $builder) => $builder->where('auditable_type', (string) $query->filter('auditable_type')),
            )
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('action', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%")
                        ->orWhere('user_agent', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->latest('created_at')
                    ->latest('id');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'action' => $builder->orderBy('action', $query->sortDirection)->orderByDesc('created_at'),
                    'auditable_type' => $builder->orderBy('auditable_type', $query->sortDirection)->orderByDesc('created_at'),
                    default => $builder->orderBy('created_at', $query->sortDirection)->orderBy('id', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }
}
