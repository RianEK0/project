<?php

namespace App\Http\Requests\Notifications;

use Illuminate\Foundation\Http\FormRequest;

class SendWorkspaceNotificationRequest extends FormRequest
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
            'subject' => ['nullable', 'string', 'max:160'],
            'title' => ['required', 'string', 'min:3', 'max:160'],
            'message' => ['required', 'string', 'min:5', 'max:4000'],
            'channels' => ['required', 'array', 'min:1'],
            'channels.*' => ['required', 'in:in_app,email,push,whatsapp,slack,microsoft_teams'],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'role_names' => ['nullable', 'array'],
            'role_names.*' => ['string', 'exists:roles,name'],
            'action_url' => ['nullable', 'url', 'max:255'],
            'action_label' => ['nullable', 'string', 'max:80'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $userIds = $this->input('user_ids', []);
            $roleNames = $this->input('role_names', []);

            if ($userIds === [] && $roleNames === []) {
                $validator->errors()->add('recipients', 'Select at least one user or role recipient.');
            }
        });
    }
}
