<?php

namespace App\Http\Resources\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveApprovalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stage' => $this->stage,
            'status' => $this->status,
            'acted_at' => $this->acted_at,
            'remarks' => $this->remarks,
            'approver' => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
                'email' => $this->approver->email,
            ] : null,
            'leave_request' => $this->leaveRequest ? [
                'id' => $this->leaveRequest->id,
                'status' => $this->leaveRequest->status,
                'start_date' => $this->leaveRequest->start_date,
                'end_date' => $this->leaveRequest->end_date,
                'total_days' => $this->leaveRequest->total_days,
                'reason' => $this->leaveRequest->reason,
                'leave_type' => $this->leaveRequest->leaveType ? [
                    'id' => $this->leaveRequest->leaveType->id,
                    'name' => $this->leaveRequest->leaveType->name,
                    'code' => $this->leaveRequest->leaveType->code,
                    'color' => $this->leaveRequest->leaveType->color,
                ] : null,
                'employee' => $this->leaveRequest->employee ? [
                    'id' => $this->leaveRequest->employee->id,
                    'employee_number' => $this->leaveRequest->employee->employee_number,
                    'full_name' => $this->leaveRequest->employee->full_name,
                    'department' => $this->leaveRequest->employee->department?->name,
                    'team' => $this->leaveRequest->employee->team?->name,
                ] : null,
            ] : null,
        ];
    }
}
