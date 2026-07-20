<?php

namespace App\Http\Resources\Assets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItAssetMaintenanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'maintenance_type' => $this->maintenance_type,
            'vendor_name' => $this->vendor_name,
            'scheduled_at' => $this->scheduled_at?->toDateString(),
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'status' => $this->status,
            'warranty_claim' => (bool) $this->warranty_claim,
            'cost_amount' => $this->cost_amount !== null ? (float) $this->cost_amount : null,
            'currency' => $this->currency,
            'notes' => $this->notes,
            'resolution' => $this->resolution,
            'reported_by' => $this->reporter ? [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
                'email' => $this->reporter->email,
            ] : null,
            'asset' => $this->whenLoaded('asset', function (): array {
                return [
                    'id' => $this->asset->id,
                    'asset_code' => $this->asset->asset_code,
                    'name' => $this->asset->name,
                    'category' => $this->asset->category,
                    'status' => $this->asset->status,
                ];
            }),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
