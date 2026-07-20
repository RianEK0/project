<?php

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecruitmentCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'candidate_code' => ['nullable', 'string', 'max:40', Rule::unique('recruitment_candidates', 'candidate_code')],
            'full_name' => ['required', 'string', 'min:3', 'max:150'],
            'email' => ['required', 'email', 'max:255', Rule::unique('recruitment_candidates', 'email')],
            'phone' => ['nullable', 'string', 'max:50'],
            'source' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:150'],
            'current_company' => ['nullable', 'string', 'max:150'],
            'current_position' => ['nullable', 'string', 'max:150'],
            'experience_years' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'expected_salary' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'summary' => ['nullable', 'string'],
            'linkedin_url' => ['nullable', 'url', 'max:255'],
            'portfolio_url' => ['nullable', 'url', 'max:255'],
            'status' => ['nullable', 'in:active,on_hold,rejected,hired'],
            'last_contacted_at' => ['nullable', 'date'],
            'vacancy_id' => ['nullable', 'integer', 'exists:recruitment_vacancies,id'],
            'application_notes' => ['nullable', 'string'],
            'cv' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
