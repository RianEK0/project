<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;

class SubmitEmployeePerformanceReviewRequest extends FormRequest
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
            'employee_review_summary' => ['required', 'string', 'min:10'],
            'employee_review_highlights' => ['nullable', 'string'],
            'employee_review_challenges' => ['nullable', 'string'],
            'employee_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
