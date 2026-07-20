<?php

namespace App\Http\Resources\Recruitment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'applied_at' => $this->applied_at,
            'stage' => $this->stage,
            'status' => $this->status,
            'rating' => $this->rating !== null ? (float) $this->rating : null,
            'offer_sent_at' => $this->offer_sent_at,
            'offer_accepted_at' => $this->offer_accepted_at,
            'offer_letter_url' => $this->offer_letter_url,
            'offer_letter_file_name' => $this->offer_letter_file_name,
            'rejection_reason' => $this->rejection_reason,
            'notes' => $this->notes,
            'candidate' => $this->candidate ? [
                'id' => $this->candidate->id,
                'candidate_code' => $this->candidate->candidate_code,
                'full_name' => $this->candidate->full_name,
                'email' => $this->candidate->email,
                'phone' => $this->candidate->phone,
                'source' => $this->candidate->source,
                'location' => $this->candidate->location,
                'current_company' => $this->candidate->current_company,
                'current_position' => $this->candidate->current_position,
                'experience_years' => (float) $this->candidate->experience_years,
                'expected_salary' => $this->candidate->expected_salary !== null ? (float) $this->candidate->expected_salary : null,
                'currency' => $this->candidate->currency,
                'summary' => $this->candidate->summary,
                'status' => $this->candidate->status,
                'cv_url' => $this->candidate->cv_url,
                'cv_file_name' => $this->candidate->cv_file_name,
            ] : null,
            'vacancy' => $this->vacancy ? [
                'id' => $this->vacancy->id,
                'code' => $this->vacancy->code,
                'title' => $this->vacancy->title,
                'status' => $this->vacancy->status,
                'department' => $this->vacancy->department?->name,
                'branch' => $this->vacancy->branch?->name,
                'employment_type' => $this->vacancy->employment_type,
            ] : null,
            'recruiter' => $this->recruiter ? [
                'id' => $this->recruiter->id,
                'name' => $this->recruiter->name,
                'email' => $this->recruiter->email,
            ] : null,
            'hired_employee' => $this->hiredEmployee ? [
                'id' => $this->hiredEmployee->id,
                'employee_number' => $this->hiredEmployee->employee_number,
                'full_name' => $this->hiredEmployee->full_name,
                'department' => $this->hiredEmployee->department?->name,
            ] : null,
            'interviews' => RecruitmentInterviewResource::collection($this->whenLoaded('interviews')),
            'assessments' => RecruitmentAssessmentResource::collection($this->whenLoaded('assessments')),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
