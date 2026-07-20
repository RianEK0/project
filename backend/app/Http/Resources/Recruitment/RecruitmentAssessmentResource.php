<?php

namespace App\Http\Resources\Recruitment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentAssessmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'assessment_type' => $this->assessment_type,
            'assigned_at' => $this->assigned_at,
            'due_at' => $this->due_at,
            'completed_at' => $this->completed_at,
            'status' => $this->status,
            'score' => $this->score !== null ? (float) $this->score : null,
            'max_score' => $this->max_score !== null ? (float) $this->max_score : null,
            'result' => $this->result,
            'notes' => $this->notes,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'email' => $this->reviewer->email,
            ] : null,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
