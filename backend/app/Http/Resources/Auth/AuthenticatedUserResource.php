<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthenticatedUserResource extends JsonResource
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
            'email_verified_at' => $this->email_verified_at,
            'two_factor_enabled' => $this->hasTwoFactorEnabled(),
            'last_login_at' => $this->last_login_at,
            'password_changed_at' => $this->password_changed_at,
            'roles' => $this->roles->pluck('label')->values(),
            'permissions' => $this->resolvedPermissions()->pluck('code')->values(),
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'job_title' => $this->employee->job_title,
                'department' => $this->employee->department?->name,
            ] : null,
        ];
    }
}
