<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationDeliveryLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source' => $this->source,
            'channel' => $this->channel,
            'notification_type' => $this->notification_type,
            'subject' => $this->subject,
            'title' => $this->title,
            'message' => $this->message,
            'recipient' => $this->recipient,
            'status' => $this->status,
            'transport_mode' => $this->transport_mode,
            'notification_uuid' => $this->notification_uuid,
            'payload' => $this->payload,
            'sent_at' => $this->sent_at,
            'recipient_user' => $this->recipientUser ? [
                'id' => $this->recipientUser->id,
                'name' => $this->recipientUser->name,
                'email' => $this->recipientUser->email,
                'employee' => $this->recipientUser->employee ? [
                    'id' => $this->recipientUser->employee->id,
                    'employee_number' => $this->recipientUser->employee->employee_number,
                    'full_name' => $this->recipientUser->employee->full_name,
                    'department' => $this->recipientUser->employee->department?->name,
                ] : null,
            ] : null,
            'sender' => $this->sender ? [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'email' => $this->sender->email,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
