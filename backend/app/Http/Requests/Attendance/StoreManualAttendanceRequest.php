<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreManualAttendanceRequest extends FormRequest
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
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'attendance_date' => ['required', 'date'],
            'shift_id' => ['nullable', 'integer', 'exists:attendance_shifts,id'],
            'clock_in_at' => ['required', 'date'],
            'clock_out_at' => ['required', 'date', 'after:clock_in_at'],
            'clock_in_photo' => ['nullable', 'image', 'max:4096'],
            'clock_out_photo' => ['nullable', 'image', 'max:4096'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
