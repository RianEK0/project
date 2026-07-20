<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class TwoFactorDisableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'password' => ['required', 'string'],
            'code' => ['nullable', 'string', 'size:6'],
            'recovery_code' => ['nullable', 'string', 'max:32'],
        ];
    }
}
