<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationChannelConfigRequest extends FormRequest
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
            'label' => ['sometimes', 'string', 'max:120'],
            'driver' => ['sometimes', 'string', 'max:120'],
            'transport_mode' => ['sometimes', 'in:live,ready'],
            'is_enabled' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string', 'max:255'],
            'config' => ['nullable', 'array'],
            'last_tested_at' => ['nullable', 'date'],
        ];
    }
}
