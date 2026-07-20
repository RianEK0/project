<?php

namespace Modules\Assets\Infrastructure\Persistence\Models;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;

class ItAsset extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'asset_code',
        'category',
        'name',
        'brand',
        'model',
        'serial_number',
        'phone_number',
        'license_key',
        'license_expires_at',
        'vendor_name',
        'purchase_date',
        'purchase_cost',
        'currency',
        'branch_id',
        'warranty_expires_at',
        'maintenance_due_at',
        'status',
        'qr_code_value',
        'notes',
        'created_by',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'license_expires_at' => 'date',
            'purchase_date' => 'date',
            'purchase_cost' => 'float',
            'warranty_expires_at' => 'date',
            'maintenance_due_at' => 'date',
            'meta' => 'array',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(ItAssetAssignment::class, 'asset_id')
            ->orderByDesc('assigned_at')
            ->orderByDesc('id');
    }

    public function currentAssignment(): HasOne
    {
        return $this->hasOne(ItAssetAssignment::class, 'asset_id')
            ->whereNull('returned_at')
            ->latestOfMany('assigned_at');
    }

    public function maintenances(): HasMany
    {
        return $this->hasMany(ItAssetMaintenance::class, 'asset_id')
            ->orderByDesc('scheduled_at')
            ->orderByDesc('id');
    }

    public function latestMaintenance(): HasOne
    {
        return $this->hasOne(ItAssetMaintenance::class, 'asset_id')
            ->latestOfMany('scheduled_at');
    }

    public function warrantyStatus(?Carbon $today = null): string
    {
        $today ??= today();

        if (! $this->warranty_expires_at) {
            return 'none';
        }

        if ($this->warranty_expires_at->lt($today)) {
            return 'expired';
        }

        if ($this->warranty_expires_at->lte($today->copy()->addDays(45))) {
            return 'expiring';
        }

        return 'active';
    }

    public function licenseStatus(?Carbon $today = null): string
    {
        $today ??= today();

        if (! $this->license_expires_at) {
            return 'none';
        }

        if ($this->license_expires_at->lt($today)) {
            return 'expired';
        }

        if ($this->license_expires_at->lte($today->copy()->addDays(45))) {
            return 'expiring';
        }

        return 'active';
    }
}
