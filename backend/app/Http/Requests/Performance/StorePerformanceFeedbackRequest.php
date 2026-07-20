<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceFeedbackRequest extends FormRequest
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
            'reviewer_id' => ['nullable', 'integer', 'exists:employees,id'],
            'feedback_type' => ['nullable', 'in:peer,manager,direct_report,self,stakeholder'],
            'relationship' => ['nullable', 'string', 'max:80'],
            'strengths' => ['nullable', 'string'],
            'improvements' => ['nullable', 'string'],
            'comments' => ['nullable', 'string'],
            'rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'is_anonymous' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
