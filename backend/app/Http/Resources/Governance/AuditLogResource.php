<?php

namespace App\Http\Resources\Governance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'summary' => $this->summary,
            'auditable_type' => $this->auditable_type,
            'auditable_id' => $this->auditable_id,
            'ip_address' => $this->ip_address,
            'browser' => $this->browser,
            'user_agent' => $this->user_agent,
            'created_at' => $this->created_at,
            'actor' => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'email' => $this->actor->email,
            ] : null,
            'old_values' => $this->old_values,
            'new_values' => $this->new_values,
        ];
    }
}
