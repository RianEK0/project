<?php

namespace App\Http\Resources\Attendance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceRecordResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'attendance_date' => $this->attendance_date?->toDateString(),
            'status' => $this->status,
            'clock_in_at' => $this->clock_in_at,
            'clock_out_at' => $this->clock_out_at,
            'clock_in_source' => $this->clock_in_source,
            'clock_out_source' => $this->clock_out_source,
            'clock_in_photo_url' => $this->clock_in_photo_url,
            'clock_out_photo_url' => $this->clock_out_photo_url,
            'clock_in_latitude' => $this->clock_in_latitude,
            'clock_in_longitude' => $this->clock_in_longitude,
            'clock_out_latitude' => $this->clock_out_latitude,
            'clock_out_longitude' => $this->clock_out_longitude,
            'is_late' => $this->is_late,
            'late_minutes' => $this->late_minutes,
            'is_overtime' => $this->is_overtime,
            'overtime_minutes' => $this->overtime_minutes,
            'worked_minutes' => $this->worked_minutes,
            'is_weekend' => $this->is_weekend,
            'is_holiday' => $this->is_holiday,
            'is_corrected' => $this->is_corrected,
            'notes' => $this->notes,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'branch' => $this->employee->branch?->name,
                'department' => $this->employee->department?->name,
                'manager' => $this->employee->manager ? [
                    'id' => $this->employee->manager->id,
                    'employee_number' => $this->employee->manager->employee_number,
                    'full_name' => $this->employee->manager->full_name,
                ] : null,
            ] : null,
            'shift' => $this->shift ? [
                'id' => $this->shift->id,
                'code' => $this->shift->code,
                'name' => $this->shift->name,
                'start_time' => substr((string) $this->shift->start_time, 0, 5),
                'end_time' => substr((string) $this->shift->end_time, 0, 5),
                'grace_minutes' => $this->shift->grace_minutes,
                'requires_gps' => $this->shift->requires_gps,
                'requires_photo' => $this->shift->requires_photo,
                'requires_qr' => $this->shift->requires_qr,
                'qr_token' => $this->shift->qr_token,
            ] : null,
            'holiday' => $this->holiday ? [
                'id' => $this->holiday->id,
                'name' => $this->holiday->name,
                'holiday_date' => $this->holiday->holiday_date?->toDateString(),
                'type' => $this->holiday->type,
            ] : null,
            'created_by' => $this->createdBy ? [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
                'email' => $this->createdBy->email,
            ] : null,
            'updated_by' => $this->updatedBy ? [
                'id' => $this->updatedBy->id,
                'name' => $this->updatedBy->name,
                'email' => $this->updatedBy->email,
            ] : null,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
