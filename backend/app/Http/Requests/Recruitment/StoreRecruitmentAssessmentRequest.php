<?php

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;

class StoreRecruitmentAssessmentRequest extends FormRequest
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
            'title' => ['required', 'string', 'min:3', 'max:150'],
            'assessment_type' => ['required', 'in:technical,psychometric,case-study,assignment,behavioral'],
            'assigned_at' => ['nullable', 'date'],
            'due_at' => ['nullable', 'date', 'after_or_equal:assigned_at'],
            'completed_at' => ['nullable', 'date', 'after_or_equal:assigned_at'],
            'status' => ['required', 'in:assigned,submitted,reviewed,passed,failed'],
            'score' => ['nullable', 'numeric', 'min:0'],
            'max_score' => ['nullable', 'numeric', 'gt:0'],
            'result' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
            'reviewer_id' => ['nullable', 'integer', 'exists:users,id'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
