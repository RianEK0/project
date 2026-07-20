<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceShiftRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:150'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'grace_minutes' => ['nullable', 'integer', 'min:0', 'max:240'],
            'requires_gps' => ['nullable', 'boolean'],
            'requires_photo' => ['nullable', 'boolean'],
            'requires_qr' => ['nullable', 'boolean'],
            'latitude' => ['nullable', 'required_if:requires_gps,1', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'required_if:requires_gps,1', 'numeric', 'between:-180,180'],
            'radius_meters' => ['nullable', 'required_if:requires_gps,1', 'integer', 'min:1', 'max:100000'],
            'qr_token' => ['nullable', 'required_if:requires_qr,1', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
