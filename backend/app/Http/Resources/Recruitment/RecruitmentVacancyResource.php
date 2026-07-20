<?php

namespace App\Http\Resources\Recruitment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecruitmentVacancyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'employment_type' => $this->employment_type,
            'workplace_type' => $this->workplace_type,
            'status' => $this->status,
            'openings_count' => (int) $this->openings_count,
            'min_experience_years' => (float) $this->min_experience_years,
            'salary_min' => $this->salary_min !== null ? (float) $this->salary_min : null,
            'salary_max' => $this->salary_max !== null ? (float) $this->salary_max : null,
            'currency' => $this->currency,
            'publish_date' => $this->publish_date?->toDateString(),
            'close_date' => $this->close_date?->toDateString(),
            'description' => $this->description,
            'requirements' => $this->requirements,
            'notes' => $this->notes,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ] : null,
            'branch' => $this->branch ? [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
                'code' => $this->branch->code,
            ] : null,
            'position' => $this->position ? [
                'id' => $this->position->id,
                'name' => $this->position->name,
                'code' => $this->position->code,
                'grade' => $this->position->grade,
            ] : null,
            'recruiter' => $this->recruiter ? [
                'id' => $this->recruiter->id,
                'name' => $this->recruiter->name,
                'email' => $this->recruiter->email,
            ] : null,
            'hiring_manager' => $this->hiringManager ? [
                'id' => $this->hiringManager->id,
                'employee_number' => $this->hiringManager->employee_number,
                'full_name' => $this->hiringManager->full_name,
                'department' => $this->hiringManager->department?->name,
            ] : null,
            'applications_count' => isset($this->applications_count) ? (int) $this->applications_count : null,
            'active_applications_count' => isset($this->active_applications_count) ? (int) $this->active_applications_count : null,
            'hired_applications_count' => isset($this->hired_applications_count) ? (int) $this->hired_applications_count : null,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
