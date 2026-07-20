<?php

namespace App\Http\Resources\Assets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItAssetAssignmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assigned_at' => $this->assigned_at,
            'expected_return_at' => $this->expected_return_at?->toDateString(),
            'returned_at' => $this->returned_at,
            'assignment_condition' => $this->assignment_condition,
            'return_condition' => $this->return_condition,
            'assignment_notes' => $this->assignment_notes,
            'return_notes' => $this->return_notes,
            'status' => $this->status,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'job_title' => $this->employee->job_title,
                'department' => $this->employee->department?->name,
                'branch' => $this->employee->branch?->name,
            ] : null,
            'assigned_by' => $this->assignedBy ? [
                'id' => $this->assignedBy->id,
                'name' => $this->assignedBy->name,
                'email' => $this->assignedBy->email,
            ] : null,
            'returned_by' => $this->returnedBy ? [
                'id' => $this->returnedBy->id,
                'name' => $this->returnedBy->name,
                'email' => $this->returnedBy->email,
            ] : null,
            'asset' => $this->whenLoaded('asset', function (): array {
                return [
                    'id' => $this->asset->id,
                    'asset_code' => $this->asset->asset_code,
                    'name' => $this->asset->name,
                    'category' => $this->asset->category,
                    'status' => $this->asset->status,
                ];
            }),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
