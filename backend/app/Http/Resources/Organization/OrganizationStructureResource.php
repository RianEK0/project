<?php

namespace App\Http\Resources\Organization;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationStructureResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'cost_center' => $this->cost_center,
            'employees_count' => $this->employees_count,
            'teams_count' => $this->teams_count,
            'teams' => TeamResource::collection($this->whenLoaded('teams')),
        ];
    }
}
