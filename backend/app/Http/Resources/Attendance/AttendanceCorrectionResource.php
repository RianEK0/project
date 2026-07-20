<?php

namespace App\Http\Resources\Attendance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceCorrectionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'requested_attendance_date' => $this->requested_attendance_date?->toDateString(),
            'requested_clock_in_at' => $this->requested_clock_in_at,
            'requested_clock_out_at' => $this->requested_clock_out_at,
            'reason' => $this->reason,
            'remarks' => $this->remarks,
            'acted_at' => $this->acted_at,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'branch' => $this->employee->branch?->name,
                'department' => $this->employee->department?->name,
            ] : null,
            'attendance_record' => $this->attendanceRecord ? [
                'id' => $this->attendanceRecord->id,
                'attendance_date' => $this->attendanceRecord->attendance_date?->toDateString(),
                'status' => $this->attendanceRecord->status,
                'clock_in_at' => $this->attendanceRecord->clock_in_at,
                'clock_out_at' => $this->attendanceRecord->clock_out_at,
                'shift' => $this->attendanceRecord->shift ? [
                    'id' => $this->attendanceRecord->shift->id,
                    'code' => $this->attendanceRecord->shift->code,
                    'name' => $this->attendanceRecord->shift->name,
                ] : null,
            ] : null,
            'requester' => $this->requester ? [
                'id' => $this->requester->id,
                'name' => $this->requester->name,
                'email' => $this->requester->email,
            ] : null,
            'approver' => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
                'email' => $this->approver->email,
            ] : null,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'email' => $this->reviewer->email,
            ] : null,
            'snapshot_before' => $this->snapshot_before,
            'snapshot_after' => $this->snapshot_after,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
