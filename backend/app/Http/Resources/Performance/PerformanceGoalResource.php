<?php

namespace App\Http\Resources\Performance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceGoalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'goal_type' => $this->goal_type,
            'category' => $this->category,
            'description' => $this->description,
            'target_value' => $this->target_value !== null ? (float) $this->target_value : null,
            'current_value' => $this->current_value !== null ? (float) $this->current_value : null,
            'unit' => $this->unit,
            'weight' => (float) $this->weight,
            'progress_percent' => (float) $this->progress_percent,
            'status' => $this->status,
            'due_date' => $this->due_date?->toDateString(),
            'notes' => $this->notes,
            'cycle' => $this->cycle ? [
                'id' => $this->cycle->id,
                'code' => $this->cycle->code,
                'name' => $this->cycle->name,
                'status' => $this->cycle->status,
                'review_type' => $this->cycle->review_type,
            ] : null,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'job_title' => $this->employee->job_title,
                'department' => $this->employee->department?->name,
            ] : null,
            'manager' => $this->manager ? [
                'id' => $this->manager->id,
                'employee_number' => $this->manager->employee_number,
                'full_name' => $this->manager->full_name,
                'department' => $this->manager->department?->name,
            ] : null,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
