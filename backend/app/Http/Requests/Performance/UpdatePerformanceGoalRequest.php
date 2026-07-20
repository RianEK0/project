<?php

namespace App\Http\Requests\Performance;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceGoalRequest extends FormRequest
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
            'title' => ['nullable', 'string', 'min:3', 'max:160'],
            'goal_type' => ['nullable', 'in:kpi,okr,goal'],
            'category' => ['nullable', 'string', 'max:80'],
            'description' => ['nullable', 'string'],
            'target_value' => ['nullable', 'numeric', 'min:0'],
            'current_value' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:40'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'progress_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'status' => ['nullable', 'in:draft,on_track,at_risk,completed,cancelled'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
