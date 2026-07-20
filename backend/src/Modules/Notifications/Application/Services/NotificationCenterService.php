<?php

namespace Modules\Notifications\Application\Services;

use App\Models\User;
use App\Notifications\Workspace\WorkspaceBroadcastNotification;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Notifications\Infrastructure\Persistence\Models\NotificationChannelConfig;
use Modules\Notifications\Infrastructure\Persistence\Models\NotificationDeliveryLog;
use Shared\Application\Support\CollectionPaginator;
use Shared\Application\Support\CollectionQuery;
use Shared\Application\Support\ListQueryOptions;

class NotificationCenterService
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor): array
    {
        $this->assertCanViewNotifications($actor);

        $channelConfigs = $this->channelConfigs();
        $deliveryQuery = $this->deliveryQuery($actor);
        $today = today();

        return [
            'current_date' => $today->toDateString(),
            'stats' => [
                'unread_inbox' => $actor->unreadNotifications()->count(),
                'total_inbox' => $actor->notifications()->count(),
                'delivered_today' => (clone $deliveryQuery)
                    ->where('status', 'delivered')
                    ->whereDate('created_at', $today->toDateString())
                    ->count(),
                'live_channels' => $channelConfigs
                    ->where('transport_mode', 'live')
                    ->where('is_enabled', true)
                    ->count(),
                'ready_connectors' => $channelConfigs
                    ->where('transport_mode', 'ready')
                    ->count(),
                'disabled_channels' => $channelConfigs
                    ->where('is_enabled', false)
                    ->count(),
            ],
            'channel_health' => $channelConfigs->values(),
            'recent_inbox' => $actor->notifications()
                ->latest()
                ->limit(6)
                ->get(),
            'recent_deliveries' => (clone $deliveryQuery)
                ->latest('created_at')
                ->limit(8)
                ->get(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(User $actor): array
    {
        $this->assertCanViewNotifications($actor);

        $canManage = $actor->hasPermissionTo('notifications.manage');

        return [
            'can_manage' => $canManage,
            'channels' => $this->channelConfigs()
                ->map(static fn (NotificationChannelConfig $config): array => [
                    'channel' => $config->channel,
                    'label' => $config->label,
                    'transport_mode' => $config->transport_mode,
                    'is_enabled' => $config->is_enabled,
                ])
                ->values(),
            'roles' => $canManage
                ? Role::query()
                    ->orderBy('label')
                    ->get(['id', 'name', 'label'])
                    ->map(static fn (Role $role): array => [
                        'id' => $role->id,
                        'name' => $role->name,
                        'label' => $role->label,
                    ])
                    ->values()
                : [],
            'users' => $canManage
                ? User::query()
                    ->with('employee.department')
                    ->orderBy('name')
                    ->get(['id', 'name', 'email'])
                    ->map(static fn (User $user): array => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'employee' => $user->employee ? [
                            'id' => $user->employee->id,
                            'employee_number' => $user->employee->employee_number,
                            'full_name' => $user->employee->full_name,
                            'department' => $user->employee->department?->name,
                        ] : null,
                    ])
                    ->values()
                : [],
            'statuses' => [
                ['value' => 'delivered', 'label' => 'Delivered'],
                ['value' => 'ready', 'label' => 'Ready'],
                ['value' => 'disabled', 'label' => 'Disabled'],
                ['value' => 'failed', 'label' => 'Failed'],
            ],
            'defaults' => [
                'channels' => ['in_app', 'email'],
                'action_label' => 'Open Enterprise HRIS',
                'action_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/').'/notifications',
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return EloquentCollection<int, DatabaseNotification>
     */
    public function inbox(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        $this->assertCanViewNotifications($actor);

        $items = $actor->notifications()
            ->when(
                array_key_exists('read', $query->filters) && $query->filter('read') !== null && $query->filter('read') !== '',
                static function (Builder $builder) use ($query): void {
                    if (filter_var($query->filter('read'), FILTER_VALIDATE_BOOL)) {
                        $builder->whereNotNull('read_at');
                    } else {
                        $builder->whereNull('read_at');
                    }
                }
            )
            ->latest()
            ->get();
        $items = CollectionQuery::search($items, $query->search, static function (DatabaseNotification $notification): array {
            /** @var array<string, mixed> $data */
            $data = is_array($notification->data) ? $notification->data : [];

            return [
                $notification->type,
                $data['title'] ?? null,
                $data['subject'] ?? null,
                $data['message'] ?? null,
                $data['employee'] ?? null,
                $data['leave_type'] ?? null,
            ];
        });
        $items = CollectionQuery::sort($items, $query, static fn (DatabaseNotification $notification, string $sortBy): mixed => match ($sortBy) {
            'read_at' => $notification->read_at?->timestamp ?? 0,
            'type' => $notification->type,
            default => $notification->created_at?->timestamp ?? 0,
        });

        return CollectionPaginator::paginate($items, $query);
    }

    public function markAsRead(User $actor, DatabaseNotification $notification): DatabaseNotification
    {
        $this->assertCanViewNotifications($actor);
        $this->assertOwnsNotification($actor, $notification);

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return $notification->refresh();
    }

    public function markAllAsRead(User $actor): int
    {
        $this->assertCanViewNotifications($actor);

        return $actor->unreadNotifications()->update([
            'read_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return EloquentCollection<int, NotificationDeliveryLog>
     */
    public function deliveries(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        $this->assertCanViewNotifications($actor);

        return $this->deliveryQuery($actor)
            ->when(filled($query->filter('channel')), static fn (Builder $builder) => $builder->where('channel', (string) $query->filter('channel')))
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('subject', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%")
                        ->orWhere('recipient', 'like', "%{$search}%")
                        ->orWhere('notification_type', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', static fn (Builder $builder) => $builder->latest('created_at'), function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'sent_at' => $builder->orderBy('sent_at', $query->sortDirection),
                    'channel' => $builder->orderBy('channel', $query->sortDirection),
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    'title' => $builder->orderBy('title', $query->sortDirection),
                    default => $builder->orderBy('created_at', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function updateChannelConfig(NotificationChannelConfig $config, User $actor, array $data): NotificationChannelConfig
    {
        $this->assertCanManageNotifications($actor);

        $oldValues = $config->toArray();

        $config->forceFill([
            'label' => $data['label'] ?? $config->label,
            'driver' => $data['driver'] ?? $config->driver,
            'transport_mode' => $data['transport_mode'] ?? $config->transport_mode,
            'is_enabled' => $data['is_enabled'] ?? $config->is_enabled,
            'description' => array_key_exists('description', $data) ? $data['description'] : $config->description,
            'config' => array_key_exists('config', $data) ? $data['config'] : $config->config,
            'updated_by' => $actor->id,
            'last_tested_at' => $data['last_tested_at'] ?? $config->last_tested_at,
        ])->save();

        $config->refresh()->load('updater');

        $this->auditLogs->record(
            actor: $actor,
            auditable: $config,
            action: 'notification.channel.updated',
            summary: "Notification channel {$config->channel} updated by {$actor->name}.",
            oldValues: $oldValues,
            newValues: $config->toArray(),
        );

        return $config;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function sendBroadcast(User $actor, array $data): array
    {
        $this->assertCanManageNotifications($actor);

        $recipients = $this->resolveRecipients($data);

        if ($recipients->isEmpty()) {
            throw ValidationException::withMessages([
                'recipients' => 'Select at least one user or role recipient.',
            ]);
        }

        $requestedChannels = collect($data['channels'] ?? [])
            ->map(static fn (mixed $channel): string => (string) $channel)
            ->unique()
            ->values()
            ->all();

        $channelConfigs = NotificationChannelConfig::query()
            ->whereIn('channel', $requestedChannels)
            ->get()
            ->keyBy('channel');

        $actionUrl = $data['action_url'] ?? rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/').'/notifications';
        $subject = $data['subject'] ?? null;
        $title = $data['title'];
        $message = $data['message'];
        $sender = [
            'id' => $actor->id,
            'name' => $actor->name,
            'email' => $actor->email,
        ];

        return DB::transaction(function () use (
            $actor,
            $recipients,
            $requestedChannels,
            $channelConfigs,
            $actionUrl,
            $subject,
            $title,
            $message,
            $sender,
            $data
        ): array {
            $createdLogs = collect();
            $deliveryStats = collect();

            foreach ($recipients as $recipient) {
                $directChannels = collect(['in_app', 'email'])
                    ->filter(function (string $channel) use ($requestedChannels, $channelConfigs): bool {
                        if (! in_array($channel, $requestedChannels, true)) {
                            return false;
                        }

                        $config = $channelConfigs->get($channel);

                        return $config !== null && $config->is_enabled && $config->transport_mode === 'live';
                    })
                    ->values()
                    ->all();

                $notificationUuid = null;

                if ($directChannels !== []) {
                    $notification = new WorkspaceBroadcastNotification([
                        'channels' => $directChannels,
                        'subject' => $subject,
                        'title' => $title,
                        'message' => $message,
                        'action_url' => $actionUrl,
                        'action_label' => $data['action_label'] ?? 'Open Enterprise HRIS',
                        'source' => 'workspace',
                        'sender' => $sender,
                        'meta' => [
                            'role_names' => $data['role_names'] ?? [],
                            'user_ids' => $data['user_ids'] ?? [],
                        ],
                    ]);

                    $recipient->notify($notification);
                    $notificationUuid = $notification->id;
                }

                foreach ($requestedChannels as $channel) {
                    $config = $channelConfigs->get($channel);
                    $channelStatus = $this->channelDeliveryStatus($channel, $config, $directChannels);

                    $log = NotificationDeliveryLog::query()->create([
                        'recipient_user_id' => $recipient->id,
                        'sent_by' => $actor->id,
                        'source' => 'workspace',
                        'channel' => $channel,
                        'notification_type' => WorkspaceBroadcastNotification::class,
                        'subject' => $subject,
                        'title' => $title,
                        'message' => $message,
                        'recipient' => $this->resolveRecipientAddress($recipient, $channel),
                        'status' => $channelStatus['status'],
                        'transport_mode' => $config?->transport_mode ?? 'ready',
                        'notification_uuid' => $notificationUuid,
                        'payload' => [
                            'config' => $config?->config,
                            'action_url' => $actionUrl,
                            'action_label' => $data['action_label'] ?? 'Open Enterprise HRIS',
                            'note' => $channelStatus['note'],
                        ],
                        'sent_at' => now(),
                    ]);

                    $createdLogs->push($log);
                    $deliveryStats->push([
                        'channel' => $channel,
                        'status' => $log->status,
                    ]);
                }
            }

            $auditSnapshot = [
                'subject' => $subject,
                'title' => $title,
                'message' => $message,
                'channels' => $requestedChannels,
                'user_ids' => $data['user_ids'] ?? [],
                'role_names' => $data['role_names'] ?? [],
                'recipients_count' => $recipients->count(),
            ];

            $anchorLog = $createdLogs->first();

            if ($anchorLog) {
                $this->auditLogs->record(
                    actor: $actor,
                    auditable: $anchorLog,
                    action: 'notification.broadcast.sent',
                    summary: "Notification broadcast '{$title}' sent by {$actor->name}.",
                    newValues: $auditSnapshot,
                );
            }

            $deliveryModels = NotificationDeliveryLog::query()
                ->with(['recipientUser.employee.department', 'sender'])
                ->whereIn('id', $createdLogs->pluck('id')->all())
                ->orderBy('id')
                ->get();

            return [
                'recipients_count' => $recipients->count(),
                'deliveries_count' => $deliveryModels->count(),
                'channels' => $requestedChannels,
                'recipients' => $recipients
                    ->map(static fn (User $recipient): array => [
                        'id' => $recipient->id,
                        'name' => $recipient->name,
                        'email' => $recipient->email,
                    ])
                    ->values()
                    ->all(),
                'delivery_summary' => $deliveryStats
                    ->groupBy(static fn (array $item): string => $item['channel'].'::'.$item['status'])
                    ->map(static function (Collection $items, string $key): array {
                        [$channel, $status] = explode('::', $key, 2);

                        return [
                            'channel' => $channel,
                            'status' => $status,
                            'count' => $items->count(),
                        ];
                    })
                    ->values()
                    ->all(),
                'deliveries' => $deliveryModels,
            ];
        });
    }

    /**
     * @return EloquentCollection<int, NotificationChannelConfig>
     */
    private function channelConfigs(): EloquentCollection
    {
        return NotificationChannelConfig::query()
            ->with('updater')
            ->orderByRaw("
                CASE channel
                    WHEN 'in_app' THEN 0
                    WHEN 'email' THEN 1
                    WHEN 'push' THEN 2
                    WHEN 'whatsapp' THEN 3
                    WHEN 'slack' THEN 4
                    WHEN 'microsoft_teams' THEN 5
                    ELSE 6
                END
            ")
            ->get();
    }

    private function assertCanViewNotifications(User $actor): void
    {
        if (! $actor->hasPermissionTo('notifications.view')) {
            throw new AuthorizationException('You are not allowed to view notifications.');
        }
    }

    private function assertCanManageNotifications(User $actor): void
    {
        if (! $actor->hasPermissionTo('notifications.manage')) {
            throw new AuthorizationException('You are not allowed to manage notifications.');
        }
    }

    private function assertOwnsNotification(User $actor, DatabaseNotification $notification): void
    {
        if ($notification->notifiable_type !== $actor->getMorphClass() || (int) $notification->notifiable_id !== $actor->id) {
            throw new AuthorizationException('You are not allowed to access this notification.');
        }
    }

    private function deliveryQuery(User $actor): Builder
    {
        $query = NotificationDeliveryLog::query()
            ->with(['recipientUser.employee.department', 'sender']);

        if (! $actor->hasPermissionTo('notifications.manage')) {
            $query->where('recipient_user_id', $actor->id);
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return EloquentCollection<int, User>
     */
    private function resolveRecipients(array $data): EloquentCollection
    {
        $userIds = collect($data['user_ids'] ?? [])
            ->map(static fn (mixed $id): int => (int) $id)
            ->filter()
            ->values()
            ->all();
        $roleNames = collect($data['role_names'] ?? [])
            ->map(static fn (mixed $name): string => (string) $name)
            ->filter()
            ->values()
            ->all();

        return User::query()
            ->with(['employee.department', 'roles'])
            ->when($userIds !== [] || $roleNames !== [], function (Builder $query) use ($userIds, $roleNames): void {
                $query->where(function (Builder $recipientQuery) use ($userIds, $roleNames): void {
                    if ($userIds !== []) {
                        $recipientQuery->orWhereIn('id', $userIds);
                    }

                    if ($roleNames !== []) {
                        $recipientQuery->orWhereHas('roles', static fn (Builder $roleQuery) => $roleQuery->whereIn('name', $roleNames));
                    }
                });
            })
            ->orderBy('name')
            ->get()
            ->unique('id')
            ->values();
    }

    /**
     * @param  list<string>  $directChannels
     * @return array{status: string, note: string}
     */
    private function channelDeliveryStatus(string $channel, ?NotificationChannelConfig $config, array $directChannels): array
    {
        if ($config === null) {
            return [
                'status' => 'failed',
                'note' => 'Notification channel configuration is missing.',
            ];
        }

        if (! $config->is_enabled) {
            return [
                'status' => 'disabled',
                'note' => 'Channel is registered but currently disabled.',
            ];
        }

        if (in_array($channel, $directChannels, true)) {
            return [
                'status' => 'delivered',
                'note' => 'Notification delivered through an active live transport.',
            ];
        }

        if ($config->transport_mode === 'ready') {
            return [
                'status' => 'ready',
                'note' => 'Connector contract is ready and awaiting external provider activation.',
            ];
        }

        return [
            'status' => 'failed',
            'note' => 'No outbound transport handler is currently available.',
        ];
    }

    private function resolveRecipientAddress(User $recipient, string $channel): ?string
    {
        return match ($channel) {
            'in_app' => $recipient->name,
            'email', 'slack', 'microsoft_teams' => $recipient->email,
            'push', 'whatsapp' => $recipient->employee?->phone ?: $recipient->email,
            default => $recipient->email,
        };
    }
}
