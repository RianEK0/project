<?php

namespace App\Http\Requests\Workforce;

class StoreEmployeeRequest extends EmployeePayloadRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->employeeRules();
    }
}
