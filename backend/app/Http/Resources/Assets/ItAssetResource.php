<?php

namespace App\Http\Resources\Assets;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetAssignment;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetMaintenance;

class ItAssetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $today = Carbon::today();

        return [
            'id' => $this->id,
            'asset_code' => $this->asset_code,
            'category' => $this->category,
            'name' => $this->name,
            'brand' => $this->brand,
            'model' => $this->model,
            'serial_number' => $this->serial_number,
            'phone_number' => $this->phone_number,
            'license_key' => $this->license_key,
            'license_expires_at' => $this->license_expires_at?->toDateString(),
            'vendor_name' => $this->vendor_name,
            'purchase_date' => $this->purchase_date?->toDateString(),
            'purchase_cost' => $this->purchase_cost !== null ? (float) $this->purchase_cost : null,
            'currency' => $this->currency,
            'status' => $this->status,
            'qr_code_value' => $this->qr_code_value,
            'warranty_expires_at' => $this->warranty_expires_at?->toDateString(),
            'maintenance_due_at' => $this->maintenance_due_at?->toDateString(),
            'warranty_status' => $this->warrantyStatus($today),
            'license_status' => $this->licenseStatus($today),
            'notes' => $this->notes,
            'branch' => $this->branch ? [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
                'code' => $this->branch->code,
            ] : null,
            'creator' => $this->creator ? [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'email' => $this->creator->email,
            ] : null,
            'assignments_count' => isset($this->assignments_count) ? (int) $this->assignments_count : null,
            'maintenances_count' => isset($this->maintenances_count) ? (int) $this->maintenances_count : null,
            'current_assignment' => $this->currentAssignment ? (new ItAssetAssignmentResource($this->currentAssignment))->resolve() : null,
            'latest_maintenance' => $this->latestMaintenance ? (new ItAssetMaintenanceResource($this->latestMaintenance))->resolve() : null,
            'assignment_history' => ItAssetAssignmentResource::collection($this->whenLoaded('assignments')),
            'maintenance_history' => ItAssetMaintenanceResource::collection($this->whenLoaded('maintenances')),
            'history' => $this->when(
                $this->relationLoaded('assignments') || $this->relationLoaded('maintenances'),
                fn (): array => $this->historyItems(),
            ),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function historyItems(): array
    {
        $assignmentEvents = collect($this->whenLoaded('assignments', $this->assignments, collect()))
            ->flatMap(function (ItAssetAssignment $assignment): array {
                $events = [[
                    'type' => 'assignment',
                    'title' => sprintf('Assigned to %s', $assignment->employee?->full_name ?? 'employee'),
                    'description' => $assignment->assignment_notes,
                    'status' => $assignment->status,
                    'occurred_at' => $assignment->assigned_at,
                ]];

                if ($assignment->returned_at !== null) {
                    $events[] = [
                        'type' => 'return',
                        'title' => sprintf('Returned from %s', $assignment->employee?->full_name ?? 'employee'),
                        'description' => $assignment->return_notes,
                        'status' => 'returned',
                        'occurred_at' => $assignment->returned_at,
                    ];
                }

                return $events;
            });

        $maintenanceEvents = collect($this->whenLoaded('maintenances', $this->maintenances, collect()))
            ->map(static function (ItAssetMaintenance $maintenance): array {
                return [
                    'type' => 'maintenance',
                    'title' => sprintf('%s maintenance', str_replace('_', ' ', ucfirst($maintenance->maintenance_type))),
                    'description' => $maintenance->resolution ?? $maintenance->notes,
                    'status' => $maintenance->status,
                    'occurred_at' => $maintenance->completed_at ?? $maintenance->started_at ?? $maintenance->scheduled_at,
                ];
            });

        return $assignmentEvents
            ->merge($maintenanceEvents)
            ->sortByDesc('occurred_at')
            ->values()
            ->all();
    }
}
