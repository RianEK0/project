<?php

namespace App\Http\Requests\Assets;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreItAssetRequest extends FormRequest
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
            'asset_code' => ['nullable', 'string', 'max:40', Rule::unique('it_assets', 'asset_code')],
            'category' => ['required', 'in:laptop,monitor,printer,phone,software_license'],
            'name' => ['required', 'string', 'min:3', 'max:160'],
            'brand' => ['nullable', 'string', 'max:120'],
            'model' => ['nullable', 'string', 'max:120'],
            'serial_number' => ['nullable', 'string', 'max:120', Rule::unique('it_assets', 'serial_number')],
            'phone_number' => ['nullable', 'string', 'max:60'],
            'license_key' => ['nullable', 'string', 'max:255'],
            'license_expires_at' => ['nullable', 'date'],
            'vendor_name' => ['nullable', 'string', 'max:160'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'warranty_expires_at' => ['nullable', 'date'],
            'maintenance_due_at' => ['nullable', 'date'],
            'status' => ['nullable', 'in:available,assigned,maintenance,retired'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
