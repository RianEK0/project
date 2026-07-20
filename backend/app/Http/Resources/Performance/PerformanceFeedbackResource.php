<?php

namespace App\Http\Resources\Performance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceFeedbackResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'feedback_type' => $this->feedback_type,
            'relationship' => $this->relationship,
            'strengths' => $this->strengths,
            'improvements' => $this->improvements,
            'comments' => $this->comments,
            'rating' => $this->rating !== null ? (float) $this->rating : null,
            'is_anonymous' => (bool) $this->is_anonymous,
            'submitted_at' => $this->submitted_at,
            'reviewer' => $this->is_anonymous ? null : [
                'employee' => $this->reviewerEmployee ? [
                    'id' => $this->reviewerEmployee->id,
                    'employee_number' => $this->reviewerEmployee->employee_number,
                    'full_name' => $this->reviewerEmployee->full_name,
                    'department' => $this->reviewerEmployee->department?->name,
                ] : null,
                'user' => $this->reviewerUser ? [
                    'id' => $this->reviewerUser->id,
                    'name' => $this->reviewerUser->name,
                    'email' => $this->reviewerUser->email,
                ] : null,
            ],
            'review' => $this->whenLoaded('review', function (): array {
                return [
                    'id' => $this->review->id,
                    'status' => $this->review->status,
                    'cycle' => $this->review->cycle ? [
                        'id' => $this->review->cycle->id,
                        'code' => $this->review->cycle->code,
                        'name' => $this->review->cycle->name,
                    ] : null,
                    'employee' => $this->review->employee ? [
                        'id' => $this->review->employee->id,
                        'employee_number' => $this->review->employee->employee_number,
                        'full_name' => $this->review->employee->full_name,
                        'department' => $this->review->employee->department?->name,
                    ] : null,
                ];
            }),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
