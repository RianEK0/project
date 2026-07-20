<?php

namespace App\Http\Requests\Workforce;

class StoreEmployeeDocumentRequest extends EmployeePayloadRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', 'string', 'max:60'],
            'label' => ['required', 'string', 'max:150'],
            'file' => ['required', 'file', 'max:10240'],
            'issued_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
