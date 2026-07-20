<?php

namespace App\Http\Resources\Payroll;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollRunResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'payroll_month' => $this->payroll_month,
            'title' => $this->title,
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),
            'status' => $this->status,
            'overtime_rate_per_hour' => $this->overtime_rate_per_hour !== null ? (float) $this->overtime_rate_per_hour : null,
            'overtime_multiplier' => (float) $this->overtime_multiplier,
            'tax_rate' => (float) $this->tax_rate,
            'bpjs_health_rate' => (float) $this->bpjs_health_rate,
            'bpjs_employment_rate' => (float) $this->bpjs_employment_rate,
            'notes' => $this->notes,
            'reviewed_at' => $this->reviewed_at,
            'rejection_reason' => $this->rejection_reason,
            'include_thr' => (bool) ($this->meta['include_thr'] ?? false),
            'formula_note' => $this->meta['formula_note'] ?? null,
            'summary' => $this->meta['summary'] ?? null,
            'items_count' => $this->when(
                isset($this->items_count),
                fn (): int => (int) $this->items_count,
                fn (): int => $this->relationLoaded('items') ? $this->items->count() : 0,
            ),
            'submitter' => $this->submitter ? [
                'id' => $this->submitter->id,
                'name' => $this->submitter->name,
                'email' => $this->submitter->email,
            ] : null,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'email' => $this->reviewer->email,
            ] : null,
            'approvals' => PayrollRunApprovalResource::collection($this->whenLoaded('approvals')),
            'items' => PayrollItemResource::collection($this->whenLoaded('items')),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
