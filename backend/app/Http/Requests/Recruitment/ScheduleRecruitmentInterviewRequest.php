<?php

namespace App\Http\Requests\Recruitment;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRecruitmentInterviewRequest extends FormRequest
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
            'interview_type' => ['required', 'in:screening,hr,technical,panel,final,culture-fit'],
            'stage' => ['nullable', 'in:applied,screening,interview,assessment,offer'],
            'scheduled_at' => ['required', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'location' => ['nullable', 'string', 'max:255'],
            'interviewer_id' => ['nullable', 'integer', 'exists:users,id'],
            'status' => ['nullable', 'in:scheduled,completed,cancelled,no_show'],
            'score' => ['nullable', 'numeric', 'between:0,5'],
            'feedback' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
