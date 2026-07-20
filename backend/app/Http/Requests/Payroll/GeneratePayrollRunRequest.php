<?php

namespace App\Http\Requests\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class GeneratePayrollRunRequest extends FormRequest
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
            'payroll_month' => ['required', 'date_format:Y-m'],
            'title' => ['required', 'string', 'min:3', 'max:120'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'overtime_rate_per_hour' => ['nullable', 'numeric', 'min:0'],
            'overtime_multiplier' => ['nullable', 'numeric', 'min:0'],
            'tax_rate' => ['required', 'numeric', 'between:0,1'],
            'bpjs_health_rate' => ['required', 'numeric', 'between:0,1'],
            'bpjs_employment_rate' => ['required', 'numeric', 'between:0,1'],
            'include_thr' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
            'employee_ids' => ['nullable', 'array'],
            'employee_ids.*' => ['integer', 'exists:employees,id'],
            'employee_adjustments' => ['nullable', 'array'],
            'employee_adjustments.*.employee_id' => ['required', 'integer', 'exists:employees,id'],
            'employee_adjustments.*.allowance_amount' => ['nullable', 'numeric', 'min:0'],
            'employee_adjustments.*.deduction_amount' => ['nullable', 'numeric', 'min:0'],
            'employee_adjustments.*.tax_amount' => ['nullable', 'numeric', 'min:0'],
            'employee_adjustments.*.bpjs_amount' => ['nullable', 'numeric', 'min:0'],
            'employee_adjustments.*.bonus_amount' => ['nullable', 'numeric', 'min:0'],
            'employee_adjustments.*.thr_amount' => ['nullable', 'numeric', 'min:0'],
            'employee_adjustments.*.notes' => ['nullable', 'string'],
            'employee_adjustments.*.allowance_breakdown' => ['nullable', 'array'],
            'employee_adjustments.*.deduction_breakdown' => ['nullable', 'array'],
        ];
    }
}
