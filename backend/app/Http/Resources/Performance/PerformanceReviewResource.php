<?php

namespace App\Http\Resources\Performance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'overall_score' => $this->overall_score !== null ? (float) $this->overall_score : null,
            'overall_rating' => $this->overall_rating,
            'cycle' => $this->cycle ? [
                'id' => $this->cycle->id,
                'code' => $this->cycle->code,
                'name' => $this->cycle->name,
                'status' => $this->cycle->status,
                'review_type' => $this->cycle->review_type,
                'period_start' => $this->cycle->period_start?->toDateString(),
                'period_end' => $this->cycle->period_end?->toDateString(),
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
            'creator' => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ] : null,
            'employee_review' => [
                'summary' => $this->employee_review_summary,
                'highlights' => $this->employee_review_highlights,
                'challenges' => $this->employee_review_challenges,
                'rating' => $this->employee_rating !== null ? (float) $this->employee_rating : null,
                'submitted_at' => $this->employee_submitted_at,
            ],
            'manager_review' => [
                'summary' => $this->manager_review_summary,
                'strengths' => $this->manager_review_strengths,
                'improvements' => $this->manager_review_improvements,
                'rating' => $this->manager_rating !== null ? (float) $this->manager_rating : null,
                'submitted_at' => $this->manager_submitted_at,
            ],
            'feedback_count' => isset($this->feedbacks_count)
                ? (int) $this->feedbacks_count
                : ($this->relationLoaded('feedbacks') ? $this->feedbacks->count() : 0),
            'feedbacks' => PerformanceFeedbackResource::collection($this->whenLoaded('feedbacks')),
            'calibration_notes' => $this->calibration_notes,
            'completed_at' => $this->completed_at,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
