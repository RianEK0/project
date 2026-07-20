<?php

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecruitmentVacancyRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:40', Rule::unique('recruitment_vacancies', 'code')],
            'title' => ['required', 'string', 'min:3', 'max:150'],
            'employment_type' => ['required', 'in:permanent,contract,probation,internship'],
            'workplace_type' => ['nullable', 'in:onsite,hybrid,remote'],
            'status' => ['nullable', 'in:draft,open,on_hold,closed,filled'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'recruiter_id' => ['nullable', 'integer', 'exists:users,id'],
            'hiring_manager_id' => ['nullable', 'integer', 'exists:employees,id'],
            'openings_count' => ['required', 'integer', 'min:1', 'max:100'],
            'min_experience_years' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0', 'gte:salary_min'],
            'currency' => ['nullable', 'string', 'max:10'],
            'publish_date' => ['nullable', 'date'],
            'close_date' => ['nullable', 'date', 'after_or_equal:publish_date'],
            'description' => ['nullable', 'string'],
            'requirements' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
