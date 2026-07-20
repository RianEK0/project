<?php

namespace App\Http\Resources\Recruitment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentInterviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'interview_type' => $this->interview_type,
            'stage' => $this->stage,
            'scheduled_at' => $this->scheduled_at,
            'duration_minutes' => $this->duration_minutes,
            'location' => $this->location,
            'status' => $this->status,
            'score' => $this->score !== null ? (float) $this->score : null,
            'feedback' => $this->feedback,
            'notes' => $this->notes,
            'interviewer' => $this->interviewer ? [
                'id' => $this->interviewer->id,
                'name' => $this->interviewer->name,
                'email' => $this->interviewer->email,
            ] : null,
            'application' => $this->whenLoaded('application', fn (): array => [
                'id' => $this->application->id,
                'stage' => $this->application->stage,
                'status' => $this->application->status,
                'candidate' => $this->application->candidate ? [
                    'id' => $this->application->candidate->id,
                    'candidate_code' => $this->application->candidate->candidate_code,
                    'full_name' => $this->application->candidate->full_name,
                ] : null,
                'vacancy' => $this->application->vacancy ? [
                    'id' => $this->application->vacancy->id,
                    'code' => $this->application->vacancy->code,
                    'title' => $this->application->vacancy->title,
                ] : null,
            ]),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
