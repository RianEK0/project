<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_name' => $this->device_name,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'remember' => $this->remember,
            'last_seen_at' => $this->last_seen_at,
            'last_refreshed_at' => $this->last_refreshed_at,
            'expires_at' => $this->expires_at,
            'revoked_at' => $this->revoked_at,
            'is_current' => (bool) ($this->is_current ?? false),
            'created_at' => $this->created_at,
        ];
    }
}
