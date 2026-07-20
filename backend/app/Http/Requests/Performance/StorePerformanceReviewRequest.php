<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceReviewRequest extends FormRequest
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
            'cycle_id' => ['required', 'integer', 'exists:performance_cycles,id'],
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'manager_id' => ['nullable', 'integer', 'exists:employees,id'],
            'status' => ['nullable', 'in:draft,employee_submitted,manager_submitted,completed'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
