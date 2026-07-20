<?php

namespace App\Http\Resources\Leave;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'default_days' => $this->default_days,
            'deducts_balance' => $this->deducts_balance,
            'count_weekends' => $this->count_weekends,
            'count_holidays' => $this->count_holidays,
            'color' => $this->color,
            'requires_attachment' => $this->requires_attachment,
            'is_active' => $this->is_active,
        ];
    }
}
