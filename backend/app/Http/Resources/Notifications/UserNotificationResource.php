<?php

namespace App\Http\Resources\Notifications;

use App\Notifications\Leave\LeaveApprovalRequiredNotification;
use App\Notifications\Workforce\EmployeeProvisionedNotification;
use App\Notifications\Workspace\WorkspaceBroadcastNotification;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserNotificationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array<string, mixed> $data */
        $data = $this->data;
        $content = $this->content($data);

        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $content['title'],
            'subject' => $content['subject'],
            'message' => $content['message'],
            'action_url' => $data['action_url'] ?? null,
            'action_label' => $data['action_label'] ?? null,
            'channels' => $data['channels'] ?? ['in_app'],
            'source' => $data['source'] ?? 'system',
            'sender' => $data['sender'] ?? null,
            'payload' => $data,
            'read_at' => $this->read_at,
            'is_read' => $this->read_at !== null,
            'created_at' => $this->created_at,
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array{title: string, subject: string|null, message: string}
     */
    private function content(array $data): array
    {
        return match ($this->type) {
            WorkspaceBroadcastNotification::class => [
                'title' => (string) ($data['title'] ?? 'Workspace Notification'),
                'subject' => isset($data['subject']) ? (string) $data['subject'] : null,
                'message' => (string) ($data['message'] ?? 'A new workspace notification is available.'),
            ],
            LeaveApprovalRequiredNotification::class => [
                'title' => 'Leave approval required',
                'subject' => 'Leave approval required',
                'message' => sprintf(
                    '%s submitted %s leave from %s to %s.',
                    (string) ($data['employee'] ?? 'An employee'),
                    (string) ($data['leave_type'] ?? 'leave'),
                    (string) ($data['start_date'] ?? '-'),
                    (string) ($data['end_date'] ?? '-'),
                ),
            ],
            EmployeeProvisionedNotification::class => [
                'title' => 'New employee record provisioned',
                'subject' => 'New employee record provisioned',
                'message' => sprintf(
                    '%s has been provisioned in %s.',
                    (string) ($data['full_name'] ?? 'A new employee'),
                    (string) ($data['department'] ?? 'the organization'),
                ),
            ],
            default => [
                'title' => 'Notification',
                'subject' => null,
                'message' => isset($data['message']) ? (string) $data['message'] : 'A new notification is available.',
            ],
        };
    }
}
