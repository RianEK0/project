<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notifications\SendWorkspaceNotificationRequest;
use App\Http\Requests\Notifications\UpdateNotificationChannelConfigRequest;
use App\Http\Resources\Notifications\NotificationChannelConfigResource;
use App\Http\Resources\Notifications\NotificationDeliveryLogResource;
use App\Http\Resources\Notifications\UserNotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Modules\Notifications\Application\Services\NotificationCenterService;
use Modules\Notifications\Infrastructure\Persistence\Models\NotificationChannelConfig;
use Shared\Application\Support\ApiResponse;
use Shared\Application\Support\ListQueryOptions;

class NotificationCenterController extends Controller
{
    public function __construct(
        private readonly NotificationCenterService $notifications,
    ) {
    }

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->notifications->overview($request->user('api'));

        return ApiResponse::success([
            'current_date' => $overview['current_date'],
            'stats' => $overview['stats'],
            'channel_health' => NotificationChannelConfigResource::collection($overview['channel_health'])->resolve(),
            'recent_inbox' => UserNotificationResource::collection($overview['recent_inbox'])->resolve(),
            'recent_deliveries' => NotificationDeliveryLogResource::collection($overview['recent_deliveries'])->resolve(),
        ]);
    }

    public function lookups(Request $request): JsonResponse
    {
        return ApiResponse::success($this->notifications->lookups($request->user('api')));
    }

    public function inbox(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['read'],
            allowedSorts: ['default', 'created_at', 'read_at', 'type'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $notifications = $this->notifications->inbox($request->user('api'), $query);

        return ApiResponse::paginated(
            $notifications,
            UserNotificationResource::collection($notifications->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function markRead(Request $request, DatabaseNotification $notification): JsonResponse
    {
        return ApiResponse::success(
            new UserNotificationResource(
                $this->notifications->markAsRead($request->user('api'), $notification),
            ),
            'Notification marked as read.',
        );
    }

    public function markAllRead(Request $request): JsonResponse
    {
        return ApiResponse::success([
            'updated_count' => $this->notifications->markAllAsRead($request->user('api')),
        ], 'All notifications marked as read.');
    }

    public function deliveries(Request $request): JsonResponse
    {
        $query = ListQueryOptions::fromRequest(
            $request,
            allowedFilters: ['channel', 'status'],
            allowedSorts: ['default', 'created_at', 'sent_at', 'channel', 'status', 'title'],
            defaultSortBy: 'default',
            defaultSortDirection: 'desc',
        );
        $deliveries = $this->notifications->deliveries($request->user('api'), $query);

        return ApiResponse::paginated(
            $deliveries,
            NotificationDeliveryLogResource::collection($deliveries->items())->resolve(),
            meta: $query->meta(),
        );
    }

    public function updateChannel(UpdateNotificationChannelConfigRequest $request, NotificationChannelConfig $channelConfig): JsonResponse
    {
        return ApiResponse::success(
            new NotificationChannelConfigResource(
                $this->notifications->updateChannelConfig(
                    $channelConfig,
                    $request->user('api'),
                    $request->validated(),
                ),
            ),
            'Notification channel updated successfully.',
        );
    }

    public function broadcast(SendWorkspaceNotificationRequest $request): JsonResponse
    {
        $payload = $this->notifications->sendBroadcast(
            $request->user('api'),
            $request->validated(),
        );

        return ApiResponse::success([
            'recipients_count' => $payload['recipients_count'],
            'deliveries_count' => $payload['deliveries_count'],
            'channels' => $payload['channels'],
            'recipients' => $payload['recipients'],
            'delivery_summary' => $payload['delivery_summary'],
            'deliveries' => NotificationDeliveryLogResource::collection($payload['deliveries'])->resolve(),
        ], 'Notification broadcast queued successfully.', 201);
    }
}
