<?php

namespace App\Http\Resources\Performance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceCycleResource extends JsonResource
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
            'review_type' => $this->review_type,
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),
            'status' => $this->status,
            'description' => $this->description,
            'goals_count' => isset($this->goals_count) ? (int) $this->goals_count : null,
            'reviews_count' => isset($this->reviews_count) ? (int) $this->reviews_count : null,
            'completed_reviews_count' => isset($this->completed_reviews_count) ? (int) $this->completed_reviews_count : null,
            'creator' => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ] : null,
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
