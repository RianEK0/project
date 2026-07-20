<?php

namespace App\Http\Resources\Attendance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceShiftResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'start_time' => substr((string) $this->start_time, 0, 5),
            'end_time' => substr((string) $this->end_time, 0, 5),
            'grace_minutes' => $this->grace_minutes,
            'requires_gps' => $this->requires_gps,
            'requires_photo' => $this->requires_photo,
            'requires_qr' => $this->requires_qr,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'radius_meters' => $this->radius_meters,
            'qr_token' => $this->qr_token,
            'is_active' => $this->is_active,
            'assignments_count' => $this->whenCounted('assignments'),
            'meta' => $this->meta,
        ];
    }
}
