<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoginHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'successful' => $this->successful,
            'two_factor_passed' => $this->two_factor_passed,
            'failure_reason' => $this->failure_reason,
            'device_name' => $this->device_name,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'attempted_at' => $this->attempted_at,
        ];
    }
}
