<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
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
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:40', 'unique:teams,code'],
            'description' => ['nullable', 'string'],
            'lead_employee_id' => ['nullable', 'integer', 'exists:employees,id'],
        ];
    }
}
