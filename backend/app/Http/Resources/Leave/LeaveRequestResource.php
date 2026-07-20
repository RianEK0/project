<?php

namespace App\Http\Resources\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'total_days' => $this->total_days,
            'calendar_days' => $this->meta['calendar_days'] ?? null,
            'balance_days' => $this->meta['balance_days'] ?? null,
            'reason' => $this->reason,
            'submitted_at' => $this->submitted_at,
            'reviewed_at' => $this->reviewed_at,
            'rejection_reason' => $this->rejection_reason,
            'leave_type' => $this->leaveType ? [
                'id' => $this->leaveType->id,
                'code' => $this->leaveType->code,
                'name' => $this->leaveType->name,
                'color' => $this->leaveType->color,
                'deducts_balance' => $this->leaveType->deducts_balance,
            ] : null,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'department' => $this->employee->department?->name,
                'team' => $this->employee->team?->name,
            ] : null,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'email' => $this->reviewer->email,
            ] : null,
            'approvals' => LeaveApprovalResource::collection($this->whenLoaded('approvals')),
            'counted_dates' => $this->meta['counted_dates'] ?? [],
            'skipped_weekends' => $this->meta['skipped_weekends'] ?? [],
            'skipped_holidays' => $this->meta['skipped_holidays'] ?? [],
            'balance_by_year' => $this->meta['balance_by_year'] ?? [],
            'meta' => $this->meta,
        ];
    }
}
