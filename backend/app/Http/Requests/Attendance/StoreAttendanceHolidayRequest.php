<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceHolidayRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:150'],
            'holiday_date' => ['required', 'date'],
            'type' => ['required', Rule::in(['public', 'religious', 'company', 'other'])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
