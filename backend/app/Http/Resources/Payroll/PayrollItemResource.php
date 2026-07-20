<?php

namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'currency' => $this->currency,
            'basic_salary' => (float) $this->basic_salary,
            'allowance_amount' => (float) $this->allowance_amount,
            'deduction_amount' => (float) $this->deduction_amount,
            'tax_amount' => (float) $this->tax_amount,
            'bpjs_amount' => (float) $this->bpjs_amount,
            'overtime_minutes' => (int) $this->overtime_minutes,
            'overtime_amount' => (float) $this->overtime_amount,
            'bonus_amount' => (float) $this->bonus_amount,
            'thr_amount' => (float) $this->thr_amount,
            'gross_amount' => (float) $this->gross_amount,
            'net_amount' => (float) $this->net_amount,
            'notes' => $this->notes,
            'generated_at' => $this->generated_at,
            'employee' => $this->employee ? [
                'id' => $this->employee->id,
                'employee_number' => $this->employee->employee_number,
                'full_name' => $this->employee->full_name,
                'department' => $this->employee->department?->name,
                'position' => $this->employee->position?->name ?? $this->employee->job_title,
            ] : null,
            'payroll_run' => $this->whenLoaded('payrollRun', fn (): array => [
                'id' => $this->payrollRun->id,
                'payroll_month' => $this->payrollRun->payroll_month,
                'title' => $this->payrollRun->title,
                'status' => $this->payrollRun->status,
                'period_start' => $this->payrollRun->period_start?->toDateString(),
                'period_end' => $this->payrollRun->period_end?->toDateString(),
            ]),
            'salary_breakdown' => $this->meta['salary_breakdown'] ?? [],
            'allowance_breakdown' => $this->meta['allowance_breakdown'] ?? [],
            'deduction_breakdown' => $this->meta['deduction_breakdown'] ?? [],
            'formula' => $this->meta['formula'] ?? [],
            'meta' => $this->meta,
        ];
    }
}
