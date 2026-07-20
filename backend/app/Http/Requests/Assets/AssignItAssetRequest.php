<?php

namespace App\Http\Requests\Assets;

use Illuminate\Foundation\Http\FormRequest;

class AssignItAssetRequest extends FormRequest
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
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'assigned_at' => ['nullable', 'date'],
            'expected_return_at' => ['nullable', 'date'],
            'assignment_condition' => ['nullable', 'in:excellent,good,fair,damaged'],
            'assignment_notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
