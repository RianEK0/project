<?php

namespace Modules\Assets\Application\Services;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Assets\Infrastructure\Persistence\Models\ItAsset;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetAssignment;
use Modules\Assets\Infrastructure\Persistence\Models\ItAssetMaintenance;
use Modules\Governance\Application\Services\AuditLogService;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Shared\Application\Support\ListQueryOptions;

class ItAssetService
{
    public function __construct(
        private readonly AuditLogService $auditLogs,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(User $actor): array
    {
        $assets = $this->assetsQuery($actor)->get();
        $today = today();
        $expiringCoverage = $assets->filter(function (ItAsset $asset) use ($today): bool {
            $warrantyExpiring = $asset->warranty_expires_at !== null
                && $asset->warranty_expires_at->between($today, $today->copy()->addDays(45));
            $licenseExpiring = $asset->license_expires_at !== null
                && $asset->license_expires_at->between($today, $today->copy()->addDays(45));

            return $warrantyExpiring || $licenseExpiring;
        });

        $warrantyWatch = $this->assetsQuery($actor)
            ->with($this->assetRelations())
            ->where(function (Builder $query) use ($today): void {
                $query
                    ->whereBetween('warranty_expires_at', [$today->toDateString(), $today->copy()->addDays(45)->toDateString()])
                    ->orWhereBetween('license_expires_at', [$today->toDateString(), $today->copy()->addDays(45)->toDateString()]);
            })
            ->orderByRaw('COALESCE(warranty_expires_at, license_expires_at)')
            ->limit(6)
            ->get();

        $maintenanceQueue = ItAssetMaintenance::query()
            ->with($this->maintenanceRelations())
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->orderBy('scheduled_at')
            ->orderBy('id')
            ->limit(6)
            ->get();

        return [
            'current_date' => $today->toDateString(),
            'stats' => [
                'total_assets' => $assets->count(),
                'assigned_assets' => $assets->where('status', 'assigned')->count(),
                'maintenance_assets' => $assets->where('status', 'maintenance')->count(),
                'available_assets' => $assets->where('status', 'available')->count(),
                'software_licenses' => $assets->where('category', 'software_license')->count(),
                'expiring_coverage' => $expiringCoverage->count(),
            ],
            'category_distribution' => $assets
                ->groupBy('category')
                ->map(static fn (Collection $collection, string $category): array => [
                    'category' => $category,
                    'count' => $collection->count(),
                ])
                ->values()
                ->sortBy('category')
                ->values()
                ->all(),
            'status_distribution' => $assets
                ->groupBy('status')
                ->map(static fn (Collection $collection, string $status): array => [
                    'status' => $status,
                    'count' => $collection->count(),
                ])
                ->values()
                ->sortBy('status')
                ->values()
                ->all(),
            'warranty_watch' => $warrantyWatch,
            'maintenance_queue' => $maintenanceQueue,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function lookups(User $actor): array
    {
        $this->assertCanViewAssets($actor);

        return [
            'employees' => Employee::query()
                ->with(['department', 'branch'])
                ->whereIn('employment_status', ['active', 'probation'])
                ->orderBy('first_name')
                ->orderBy('last_name')
                ->get()
                ->map(static fn (Employee $employee): array => [
                    'id' => $employee->id,
                    'employee_number' => $employee->employee_number,
                    'full_name' => $employee->full_name,
                    'job_title' => $employee->job_title,
                    'department' => $employee->department?->name,
                    'branch' => $employee->branch?->name,
                ])
                ->values(),
            'branches' => Branch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code'])
                ->map(static fn (Branch $branch): array => [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'code' => $branch->code,
                ])
                ->values(),
            'categories' => [
                ['value' => 'laptop', 'label' => 'Laptop'],
                ['value' => 'monitor', 'label' => 'Monitor'],
                ['value' => 'printer', 'label' => 'Printer'],
                ['value' => 'phone', 'label' => 'Phone'],
                ['value' => 'software_license', 'label' => 'Software License'],
            ],
            'asset_statuses' => [
                ['value' => 'available', 'label' => 'Available'],
                ['value' => 'assigned', 'label' => 'Assigned'],
                ['value' => 'maintenance', 'label' => 'Maintenance'],
                ['value' => 'retired', 'label' => 'Retired'],
            ],
            'assignment_conditions' => [
                ['value' => 'excellent', 'label' => 'Excellent'],
                ['value' => 'good', 'label' => 'Good'],
                ['value' => 'fair', 'label' => 'Fair'],
                ['value' => 'damaged', 'label' => 'Damaged'],
            ],
            'maintenance_types' => [
                ['value' => 'preventive', 'label' => 'Preventive'],
                ['value' => 'corrective', 'label' => 'Corrective'],
                ['value' => 'warranty', 'label' => 'Warranty'],
            ],
            'maintenance_statuses' => [
                ['value' => 'scheduled', 'label' => 'Scheduled'],
                ['value' => 'in_progress', 'label' => 'In Progress'],
                ['value' => 'completed', 'label' => 'Completed'],
                ['value' => 'cancelled', 'label' => 'Cancelled'],
            ],
            'defaults' => [
                'category' => 'laptop',
                'status' => 'available',
                'currency' => 'IDR',
                'current_date' => today()->toDateString(),
                'purchase_date' => today()->toDateString(),
                'assignment_condition' => 'good',
                'maintenance_type' => 'preventive',
                'maintenance_status' => 'scheduled',
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, ItAsset>
     */
    public function assets(User $actor, ListQueryOptions $query): LengthAwarePaginator
    {
        $this->assertCanViewAssets($actor);

        return $this->assetsQuery($actor)
            ->with($this->assetRelations())
            ->withCount(['assignments', 'maintenances'])
            ->when(filled($query->filter('category')), static fn (Builder $builder) => $builder->where('category', (string) $query->filter('category')))
            ->when(filled($query->filter('status')), static fn (Builder $builder) => $builder->where('status', (string) $query->filter('status')))
            ->when(filled($query->filter('employee_id')), static fn (Builder $builder) => $builder->whereHas('currentAssignment', static fn (Builder $assignmentQuery) => $assignmentQuery->where('employee_id', (int) $query->filter('employee_id'))))
            ->when(filled($query->filter('branch_id')), static fn (Builder $builder) => $builder->where('branch_id', (int) $query->filter('branch_id')))
            ->when($query->search, function (Builder $builder, string $search): void {
                $builder->where(function (Builder $innerQuery) use ($search): void {
                    $innerQuery
                        ->where('asset_code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%")
                        ->orWhere('serial_number', 'like', "%{$search}%")
                        ->orWhere('phone_number', 'like', "%{$search}%")
                        ->orWhere('license_key', 'like', "%{$search}%")
                        ->orWhere('vendor_name', 'like', "%{$search}%");
                });
            })
            ->when($query->sortBy === 'default', function (Builder $builder): void {
                $builder
                    ->orderByRaw("
                        CASE status
                            WHEN 'assigned' THEN 0
                            WHEN 'maintenance' THEN 1
                            WHEN 'available' THEN 2
                            WHEN 'retired' THEN 3
                            ELSE 4
                        END
                    ")
                    ->orderBy('category')
                    ->orderBy('asset_code');
            }, function (Builder $builder) use ($query): void {
                match ($query->sortBy) {
                    'category' => $builder->orderBy('category', $query->sortDirection),
                    'status' => $builder->orderBy('status', $query->sortDirection),
                    'purchase_date' => $builder->orderBy('purchase_date', $query->sortDirection),
                    'warranty_expires_at' => $builder->orderBy('warranty_expires_at', $query->sortDirection),
                    default => $builder->orderBy('asset_code', $query->sortDirection),
                };
            })
            ->paginate($query->perPage, ['*'], 'page', $query->page);
    }

    public function showAsset(User $actor, ItAsset $asset): ItAsset
    {
        $this->assertCanViewAssets($actor);

        return $asset->loadMissing($this->assetDetailRelations())->loadCount(['assignments', 'maintenances']);
    }

    public function createAsset(User $actor, array $data): ItAsset
    {
        $this->assertCanManageAssets($actor);

        return DB::transaction(function () use ($actor, $data): ItAsset {
            $assetCode = $data['asset_code'] ?? $this->nextAssetCode($data['category']);
            $asset = ItAsset::query()->create([
                'asset_code' => $assetCode,
                'category' => $data['category'],
                'name' => $data['name'],
                'brand' => $data['brand'] ?? null,
                'model' => $data['model'] ?? null,
                'serial_number' => $data['serial_number'] ?? null,
                'phone_number' => $data['phone_number'] ?? null,
                'license_key' => $data['license_key'] ?? null,
                'license_expires_at' => $data['license_expires_at'] ?? null,
                'vendor_name' => $data['vendor_name'] ?? null,
                'purchase_date' => $data['purchase_date'] ?? null,
                'purchase_cost' => $data['purchase_cost'] ?? null,
                'currency' => $data['currency'] ?? 'IDR',
                'branch_id' => $data['branch_id'] ?? null,
                'warranty_expires_at' => $data['warranty_expires_at'] ?? null,
                'maintenance_due_at' => $data['maintenance_due_at'] ?? null,
                'status' => $data['status'] ?? 'available',
                'qr_code_value' => $this->buildQrCodeValue($assetCode),
                'notes' => $data['notes'] ?? null,
                'created_by' => $actor->id,
                'meta' => $data['meta'] ?? null,
            ]);

            $asset->load($this->assetRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $asset,
                action: 'asset.created',
                summary: "IT asset {$asset->asset_code} created by {$actor->name}.",
                newValues: $asset->toArray(),
            );

            return $asset;
        });
    }

    public function assignAsset(ItAsset $asset, User $actor, array $data): ItAssetAssignment
    {
        $this->assertCanManageAssets($actor);

        if ($asset->status === 'maintenance') {
            throw ValidationException::withMessages([
                'asset_id' => 'Asset under maintenance cannot be assigned.',
            ]);
        }

        if ($asset->status === 'retired') {
            throw ValidationException::withMessages([
                'asset_id' => 'Retired asset cannot be assigned.',
            ]);
        }

        if ($asset->currentAssignment()->exists()) {
            throw ValidationException::withMessages([
                'asset_id' => 'Asset already has an active assignment.',
            ]);
        }

        return DB::transaction(function () use ($asset, $actor, $data): ItAssetAssignment {
            $assignment = ItAssetAssignment::query()->create([
                'asset_id' => $asset->id,
                'employee_id' => $data['employee_id'],
                'assigned_by' => $actor->id,
                'assigned_at' => $data['assigned_at'] ?? now(),
                'expected_return_at' => $data['expected_return_at'] ?? null,
                'assignment_condition' => $data['assignment_condition'] ?? null,
                'assignment_notes' => $data['assignment_notes'] ?? null,
                'status' => 'active',
                'meta' => $data['meta'] ?? null,
            ]);

            $asset->forceFill(['status' => 'assigned'])->save();
            $assignment->load($this->assignmentRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $assignment,
                action: 'asset.assigned',
                summary: "IT asset {$asset->asset_code} assigned to {$assignment->employee?->full_name}.",
                newValues: $assignment->toArray(),
            );

            return $assignment;
        });
    }

    public function returnAsset(ItAssetAssignment $assignment, User $actor, array $data): ItAssetAssignment
    {
        $this->assertCanManageAssets($actor);

        if ($assignment->returned_at !== null) {
            throw ValidationException::withMessages([
                'assignment_id' => 'Asset assignment has already been returned.',
            ]);
        }

        return DB::transaction(function () use ($assignment, $actor, $data): ItAssetAssignment {
            $oldValues = $assignment->toArray();

            $assignment->forceFill([
                'returned_by' => $actor->id,
                'returned_at' => $data['returned_at'] ?? now(),
                'return_condition' => $data['return_condition'] ?? null,
                'return_notes' => $data['return_notes'] ?? null,
                'status' => 'returned',
                'meta' => array_merge($assignment->meta ?? [], $data['meta'] ?? []),
            ])->save();

            $assignment->asset?->forceFill(['status' => 'available'])->save();
            $assignment->refresh()->load($this->assignmentRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $assignment,
                action: 'asset.returned',
                summary: "IT asset {$assignment->asset?->asset_code} returned from {$assignment->employee?->full_name}.",
                oldValues: $oldValues,
                newValues: $assignment->toArray(),
            );

            return $assignment;
        });
    }

    public function logMaintenance(ItAsset $asset, User $actor, array $data): ItAssetMaintenance
    {
        $this->assertCanManageAssets($actor);

        return DB::transaction(function () use ($asset, $actor, $data): ItAssetMaintenance {
            $maintenance = ItAssetMaintenance::query()->create([
                'asset_id' => $asset->id,
                'reported_by' => $actor->id,
                'maintenance_type' => $data['maintenance_type'] ?? 'preventive',
                'vendor_name' => $data['vendor_name'] ?? null,
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'started_at' => $data['started_at'] ?? null,
                'completed_at' => $data['completed_at'] ?? null,
                'status' => $data['status'] ?? 'scheduled',
                'warranty_claim' => (bool) ($data['warranty_claim'] ?? false),
                'cost_amount' => $data['cost_amount'] ?? null,
                'currency' => $data['currency'] ?? 'IDR',
                'notes' => $data['notes'] ?? null,
                'resolution' => $data['resolution'] ?? null,
                'meta' => $data['meta'] ?? null,
            ]);

            $asset->forceFill([
                'status' => in_array($maintenance->status, ['scheduled', 'in_progress'], true) ? 'maintenance' : ($asset->currentAssignment()->exists() ? 'assigned' : 'available'),
                'maintenance_due_at' => $data['next_maintenance_due_at'] ?? $asset->maintenance_due_at,
            ])->save();

            $maintenance->load($this->maintenanceRelations());

            $this->auditLogs->record(
                actor: $actor,
                auditable: $maintenance,
                action: 'asset.maintenance.logged',
                summary: "Maintenance log recorded for IT asset {$asset->asset_code}.",
                newValues: $maintenance->toArray(),
            );

            return $maintenance;
        });
    }

    /**
     * @return list<string>
     */
    private function assetRelations(): array
    {
        return [
            'branch',
            'creator',
            'currentAssignment.employee.department',
            'currentAssignment.assignedBy',
            'currentAssignment.returnedBy',
            'latestMaintenance.reporter',
        ];
    }

    /**
     * @return list<string>
     */
    private function assetDetailRelations(): array
    {
        return [
            ...$this->assetRelations(),
            'assignments.employee.department',
            'assignments.assignedBy',
            'assignments.returnedBy',
            'maintenances.reporter',
        ];
    }

    /**
     * @return list<string>
     */
    private function assignmentRelations(): array
    {
        return [
            'asset.branch',
            'employee.department',
            'employee.branch',
            'assignedBy',
            'returnedBy',
        ];
    }

    /**
     * @return list<string>
     */
    private function maintenanceRelations(): array
    {
        return [
            'asset.branch',
            'reporter',
        ];
    }

    private function assetsQuery(User $actor): Builder
    {
        $this->assertCanViewAssets($actor);

        return ItAsset::query();
    }

    private function assertCanViewAssets(User $actor): void
    {
        if (! $actor->hasPermissionTo('assets.view')) {
            throw new AuthorizationException('You are not allowed to view IT asset data.');
        }
    }

    private function assertCanManageAssets(User $actor): void
    {
        if (! $actor->hasPermissionTo('assets.manage')) {
            throw new AuthorizationException('You are not allowed to manage IT assets.');
        }
    }

    private function nextAssetCode(string $category): string
    {
        $prefix = match ($category) {
            'laptop' => 'LTP',
            'monitor' => 'MON',
            'printer' => 'PRN',
            'phone' => 'PHN',
            'software_license' => 'LIC',
            default => 'AST',
        };

        $max = ItAsset::query()
            ->where('asset_code', 'like', "AST-{$prefix}-%")
            ->pluck('asset_code')
            ->map(static function (string $assetCode): int {
                return preg_match('/(\d+)$/', $assetCode, $matches) === 1 ? (int) $matches[1] : 0;
            })
            ->max() ?? 0;

        return sprintf('AST-%s-%04d', $prefix, $max + 1);
    }

    private function buildQrCodeValue(string $assetCode): string
    {
        return sprintf('ITA:%s', $assetCode);
    }
}
