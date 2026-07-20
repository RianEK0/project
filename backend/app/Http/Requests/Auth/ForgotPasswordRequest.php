<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'captcha_id' => ['required', 'string', 'max:64'],
            'captcha_answer' => ['required', 'string', 'max:16'],
        ];
    }
}
