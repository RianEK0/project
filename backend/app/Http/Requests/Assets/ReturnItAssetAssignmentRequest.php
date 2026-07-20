<?php

namespace App\Http\Requests\Assets;

use Illuminate\Foundation\Http\FormRequest;

class ReturnItAssetAssignmentRequest extends FormRequest
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
            'returned_at' => ['nullable', 'date'],
            'return_condition' => ['nullable', 'in:excellent,good,fair,damaged'],
            'return_notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
