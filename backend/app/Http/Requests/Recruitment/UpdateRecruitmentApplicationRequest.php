<?php

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRecruitmentApplicationRequest extends FormRequest
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
            'stage' => ['nullable', 'in:applied,screening,interview,assessment,offer,hired,rejected'],
            'status' => ['nullable', 'in:active,on_hold,hired,rejected,withdrawn'],
            'rating' => ['nullable', 'numeric', 'between:0,5'],
            'recruiter_id' => ['nullable', 'integer', 'exists:users,id'],
            'offer_sent_at' => ['nullable', 'date'],
            'offer_accepted_at' => ['nullable', 'date', 'after_or_equal:offer_sent_at'],
            'rejection_reason' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'offer_letter' => ['nullable', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
