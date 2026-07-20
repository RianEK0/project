<?php

namespace App\Http\Requests\Workforce;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class EmployeePayloadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('employee_code') && ! $this->filled('employee_number')) {
            $this->merge([
                'employee_number' => $this->string('employee_code')->toString(),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function employeeRules(?int $employeeId = null): array
    {
        return [
            'employee_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('employees', 'employee_number')->ignore($employeeId),
            ],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'preferred_name' => ['nullable', 'string', 'max:100'],
            'work_email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('employees', 'work_email')->ignore($employeeId),
            ],
            'personal_email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender' => ['nullable', 'in:male,female,other'],
            'marital_status' => ['nullable', 'in:single,married,divorced,widowed'],
            'place_of_birth' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:2000'],
            'city' => ['nullable', 'string', 'max:120'],
            'state' => ['nullable', 'string', 'max:120'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:120'],
            'identity_card_number' => ['nullable', 'string', 'max:100'],
            'passport_number' => ['nullable', 'string', 'max:100'],
            'passport_expiry_date' => ['nullable', 'date'],
            'npwp_number' => ['nullable', 'string', 'max:100'],
            'bpjs_health_number' => ['nullable', 'string', 'max:100'],
            'bpjs_employment_number' => ['nullable', 'string', 'max:100'],
            'job_title' => ['required', 'string', 'max:150'],
            'employment_type' => ['required', 'in:permanent,contract,probation,internship'],
            'employment_status' => ['required', 'in:active,inactive,probation,resigned'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'team_id' => ['nullable', 'integer', 'exists:teams,id'],
            'division_id' => ['nullable', 'integer', 'exists:divisions,id'],
            'section_id' => ['nullable', 'integer', 'exists:sections,id'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'manager_id' => ['nullable', 'integer', 'exists:employees,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'hire_date' => ['required', 'date'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'meta' => ['nullable', 'array'],

            'family' => ['sometimes', 'array'],
            'family.*.name' => ['required', 'string', 'max:150'],
            'family.*.relationship' => ['required', 'string', 'max:80'],
            'family.*.birth_date' => ['nullable', 'date'],
            'family.*.occupation' => ['nullable', 'string', 'max:120'],
            'family.*.dependent' => ['nullable', 'boolean'],

            'emergency_contacts' => ['sometimes', 'array'],
            'emergency_contacts.*.name' => ['required', 'string', 'max:150'],
            'emergency_contacts.*.relationship' => ['required', 'string', 'max:80'],
            'emergency_contacts.*.phone' => ['required', 'string', 'max:30'],
            'emergency_contacts.*.email' => ['nullable', 'email', 'max:255'],
            'emergency_contacts.*.address' => ['nullable', 'string', 'max:500'],

            'educations' => ['sometimes', 'array'],
            'educations.*.institution' => ['required', 'string', 'max:150'],
            'educations.*.degree' => ['required', 'string', 'max:120'],
            'educations.*.major' => ['nullable', 'string', 'max:120'],
            'educations.*.start_year' => ['nullable', 'integer', 'min:1950', 'max:2100'],
            'educations.*.end_year' => ['nullable', 'integer', 'min:1950', 'max:2100'],
            'educations.*.gpa' => ['nullable', 'numeric', 'between:0,4.5'],

            'experiences' => ['sometimes', 'array'],
            'experiences.*.company' => ['required', 'string', 'max:150'],
            'experiences.*.position' => ['required', 'string', 'max:150'],
            'experiences.*.start_date' => ['required', 'date'],
            'experiences.*.end_date' => ['nullable', 'date'],
            'experiences.*.description' => ['nullable', 'string', 'max:2000'],

            'skills' => ['sometimes', 'array'],
            'skills.*.name' => ['required', 'string', 'max:120'],
            'skills.*.category' => ['nullable', 'string', 'max:80'],
            'skills.*.level' => ['nullable', 'in:beginner,intermediate,advanced,expert'],
            'skills.*.notes' => ['nullable', 'string', 'max:500'],

            'certifications' => ['sometimes', 'array'],
            'certifications.*.name' => ['required', 'string', 'max:150'],
            'certifications.*.issuer' => ['nullable', 'string', 'max:150'],
            'certifications.*.credential_id' => ['nullable', 'string', 'max:120'],
            'certifications.*.issued_at' => ['nullable', 'date'],
            'certifications.*.expires_at' => ['nullable', 'date'],

            'bank_accounts' => ['sometimes', 'array'],
            'bank_accounts.*.bank_name' => ['required', 'string', 'max:120'],
            'bank_accounts.*.account_name' => ['required', 'string', 'max:150'],
            'bank_accounts.*.account_number' => ['required', 'string', 'max:60'],
            'bank_accounts.*.branch' => ['nullable', 'string', 'max:150'],
            'bank_accounts.*.is_primary' => ['nullable', 'boolean'],

            'salary_histories' => ['sometimes', 'array'],
            'salary_histories.*.id' => ['nullable', 'integer'],
            'salary_histories.*.component' => ['required', 'string', 'max:120'],
            'salary_histories.*.amount' => ['required', 'numeric', 'min:0'],
            'salary_histories.*.currency' => ['nullable', 'string', 'max:10'],
            'salary_histories.*.pay_frequency' => ['nullable', 'string', 'max:30'],
            'salary_histories.*.effective_date' => ['required', 'date'],
            'salary_histories.*.end_date' => ['nullable', 'date'],
            'salary_histories.*.is_current' => ['nullable', 'boolean'],
            'salary_histories.*.notes' => ['nullable', 'string', 'max:1000'],
            'salary_histories.*.meta' => ['nullable', 'array'],

            'contracts' => ['sometimes', 'array'],
            'contracts.*.id' => ['nullable', 'integer'],
            'contracts.*.contract_type' => ['required', 'string', 'max:60'],
            'contracts.*.contract_number' => ['nullable', 'string', 'max:120'],
            'contracts.*.start_date' => ['required', 'date'],
            'contracts.*.end_date' => ['nullable', 'date'],
            'contracts.*.status' => ['required', 'in:active,upcoming,expired,ended'],
            'contracts.*.terms' => ['nullable', 'string', 'max:2000'],
            'contracts.*.notes' => ['nullable', 'string', 'max:1000'],
            'contracts.*.meta' => ['nullable', 'array'],
        ];
    }
}
