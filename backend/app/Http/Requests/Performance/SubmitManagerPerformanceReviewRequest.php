<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;

class SubmitManagerPerformanceReviewRequest extends FormRequest
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
            'manager_review_summary' => ['required', 'string', 'min:10'],
            'manager_review_strengths' => ['nullable', 'string'],
            'manager_review_improvements' => ['nullable', 'string'],
            'manager_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'overall_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'overall_rating' => ['nullable', 'string', 'max:60'],
            'calibration_notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
