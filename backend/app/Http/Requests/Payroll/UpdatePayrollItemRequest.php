<?php

namespace App\Http\Requests\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePayrollItemRequest extends FormRequest
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
            'allowance_amount' => ['nullable', 'numeric', 'min:0'],
            'deduction_amount' => ['nullable', 'numeric', 'min:0'],
            'tax_amount' => ['nullable', 'numeric', 'min:0'],
            'bpjs_amount' => ['nullable', 'numeric', 'min:0'],
            'bonus_amount' => ['nullable', 'numeric', 'min:0'],
            'thr_amount' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'allowance_breakdown' => ['nullable', 'array'],
            'deduction_breakdown' => ['nullable', 'array'],
        ];
    }
}
