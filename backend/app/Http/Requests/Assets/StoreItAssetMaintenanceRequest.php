<?php

namespace App\Http\Requests\Assets;

use Illuminate\Foundation\Http\FormRequest;

class StoreItAssetMaintenanceRequest extends FormRequest
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
            'maintenance_type' => ['nullable', 'in:preventive,corrective,warranty'],
            'vendor_name' => ['nullable', 'string', 'max:160'],
            'scheduled_at' => ['nullable', 'date'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'status' => ['nullable', 'in:scheduled,in_progress,completed,cancelled'],
            'warranty_claim' => ['nullable', 'boolean'],
            'cost_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'notes' => ['nullable', 'string'],
            'resolution' => ['nullable', 'string'],
            'next_maintenance_due_at' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
