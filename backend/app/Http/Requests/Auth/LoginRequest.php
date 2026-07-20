<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'remember' => ['sometimes', 'boolean'],
            'captcha_id' => ['required', 'string', 'max:64'],
            'captcha_answer' => ['required', 'string', 'max:16'],
            'device_name' => ['nullable', 'string', 'max:120'],
        ];
    }
}
