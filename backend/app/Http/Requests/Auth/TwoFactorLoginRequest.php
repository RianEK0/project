<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class TwoFactorLoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'challenge_id' => ['required', 'string', 'max:64'],
            'code' => ['nullable', 'string', 'size:6'],
            'recovery_code' => ['nullable', 'string', 'max:32'],
        ];
    }
}
