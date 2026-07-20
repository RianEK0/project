<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePerformanceCycleRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'max:40', Rule::unique('performance_cycles', 'code')],
            'name' => ['required', 'string', 'min:3', 'max:150'],
            'review_type' => ['nullable', 'in:quarterly,mid_year,annual,probation,project'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'status' => ['nullable', 'in:draft,active,closed'],
            'description' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
