<?php

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class HireRecruitmentCandidateRequest extends FormRequest
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
            'hire_date' => ['required', 'date'],
            'employment_type' => ['required', 'in:permanent,contract,probation,internship'],
            'job_title' => ['nullable', 'string', 'max:150'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'manager_id' => ['nullable', 'integer', 'exists:employees,id'],
            'work_email' => ['nullable', 'email', 'max:255', Rule::unique('employees', 'work_email')],
            'base_salary' => ['nullable', 'numeric', 'min:0'],
            'salary_currency' => ['nullable', 'string', 'max:10'],
            'contract_number' => ['nullable', 'string', 'max:120'],
            'contract_end_date' => ['nullable', 'date', 'after_or_equal:hire_date'],
            'create_contract' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
