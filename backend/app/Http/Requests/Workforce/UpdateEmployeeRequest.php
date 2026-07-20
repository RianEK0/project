<?php

namespace App\Http\Requests\Workforce;

class UpdateEmployeeRequest extends EmployeePayloadRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $employeeId = $this->route('employee')?->id;

        return $this->employeeRules($employeeId);
    }
}
