<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceCorrectionRequest extends FormRequest
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
            'attendance_record_id' => ['required', 'integer', 'exists:attendance_records,id'],
            'attendance_date' => ['required', 'date'],
            'requested_clock_in_at' => ['required', 'date'],
            'requested_clock_out_at' => ['nullable', 'date', 'after:requested_clock_in_at'],
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
