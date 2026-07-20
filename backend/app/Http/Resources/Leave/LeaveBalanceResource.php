<?php

namespace App\Http\Resources\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveBalanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'year' => $this->year,
            'allocated_days' => (float) $this->allocated_days,
            'carried_over_days' => (float) $this->carried_over_days,
            'used_days' => (float) $this->used_days,
            'pending_days' => (float) $this->pending_days,
            'adjustment_days' => (float) $this->adjustment_days,
            'available_days' => (float) $this->available_days,
            'leave_type' => $this->leaveType ? [
                'id' => $this->leaveType->id,
                'code' => $this->leaveType->code,
                'name' => $this->leaveType->name,
                'color' => $this->leaveType->color,
                'default_days' => $this->leaveType->default_days,
                'deducts_balance' => $this->leaveType->deducts_balance,
            ] : null,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'department' => $this->employee->department?->name,
            ] : null,
            'meta' => $this->meta,
        ];
    }
}
