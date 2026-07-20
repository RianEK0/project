<?php

namespace App\Http\Resources\Notifications;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationChannelConfigResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel,
            'label' => $this->label,
            'driver' => $this->driver,
            'transport_mode' => $this->transport_mode,
            'is_enabled' => (bool) $this->is_enabled,
            'status' => $this->is_enabled ? $this->transport_mode : 'disabled',
            'description' => $this->description,
            'config' => $this->config,
            'last_tested_at' => $this->last_tested_at,
            'updated_by' => $this->updater ? [
                'id' => $this->updater->id,
                'name' => $this->updater->name,
                'email' => $this->updater->email,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
