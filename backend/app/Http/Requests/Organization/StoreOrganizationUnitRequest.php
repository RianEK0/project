<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizationUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('code')) {
            $this->merge([
                'code' => strtoupper(trim($this->string('code')->toString())),
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $type = $this->string('type')->toString();

        $codeTable = match ($type) {
            'company' => 'companies',
            'branch' => 'branches',
            'department' => 'departments',
            'division' => 'divisions',
            'section' => 'sections',
            'position' => 'positions',
            default => null,
        };

        $codeRules = ['required', 'string', 'max:80'];

        if ($codeTable) {
            $codeRules[] = Rule::unique($codeTable, 'code');
        }

        return [
            'type' => ['required', Rule::in(['company', 'branch', 'department', 'division', 'section', 'position'])],
            'name' => ['required', 'string', 'max:150'],
            'code' => $codeRules,
            'description' => ['nullable', 'string', 'max:2000'],
            'company_id' => ['nullable', 'integer', 'exists:companies,id', Rule::requiredIf($type === 'branch')],
            'department_id' => ['nullable', 'integer', 'exists:departments,id', Rule::requiredIf($type === 'division')],
            'division_id' => ['nullable', 'integer', 'exists:divisions,id', Rule::requiredIf(in_array($type, ['section', 'position'], true))],
            'section_id' => ['nullable', 'integer', 'exists:sections,id'],
            'head_employee_id' => ['nullable', 'integer', 'exists:employees,id'],
            'legal_name' => ['nullable', 'string', 'max:180'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'string', 'max:2000'],
            'cost_center' => ['nullable', 'string', 'max:60'],
            'grade' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
