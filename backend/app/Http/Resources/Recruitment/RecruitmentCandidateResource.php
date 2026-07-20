<?php

namespace App\Http\Resources\Recruitment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentCandidateResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'candidate_code' => $this->candidate_code,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'source' => $this->source,
            'location' => $this->location,
            'current_company' => $this->current_company,
            'current_position' => $this->current_position,
            'experience_years' => (float) $this->experience_years,
            'expected_salary' => $this->expected_salary !== null ? (float) $this->expected_salary : null,
            'currency' => $this->currency,
            'summary' => $this->summary,
            'linkedin_url' => $this->linkedin_url,
            'portfolio_url' => $this->portfolio_url,
            'status' => $this->status,
            'cv_url' => $this->cv_url,
            'cv_file_name' => $this->cv_file_name,
            'last_contacted_at' => $this->last_contacted_at,
            'hired_at' => $this->hired_at,
            'applications' => RecruitmentApplicationResource::collection($this->whenLoaded('applications')),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
