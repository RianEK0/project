<?php

namespace App\Http\Resources\AccessControl;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccessControlUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'status' => $this->status,
            'last_login_at' => $this->last_login_at,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'department' => $this->employee->department?->name,
            ] : null,
            'roles' => $this->roles->map(static fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
            ])->values(),
        ];
    }
}
