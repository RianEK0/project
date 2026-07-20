<?php

namespace App\Http\Resources\AccessControl;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'label' => $this->label,
            'description' => $this->description,
            'users_count' => $this->users_count ?? $this->users()->count(),
            'is_locked' => $this->name === 'super-admin',
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
        ];
    }
}
