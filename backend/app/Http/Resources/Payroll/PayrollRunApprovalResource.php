<?php

namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollRunApprovalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'stage' => $this->stage,
            'status' => $this->status,
            'acted_at' => $this->acted_at,
            'remarks' => $this->remarks,
            'approver' => $this->approver ? [
                'id' => $this->approver->id,
                'name' => $this->approver->name,
                'email' => $this->approver->email,
            ] : null,
            'payroll_run' => $this->whenLoaded('payrollRun', fn (): array => [
                'id' => $this->payrollRun->id,
                'payroll_month' => $this->payrollRun->payroll_month,
                'title' => $this->payrollRun->title,
                'status' => $this->payrollRun->status,
            ]),
        ];
    }
}
