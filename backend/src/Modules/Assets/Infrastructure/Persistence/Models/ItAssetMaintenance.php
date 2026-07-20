<?php

namespace Modules\Assets\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItAssetMaintenance extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'asset_id',
        'reported_by',
        'maintenance_type',
        'vendor_name',
        'scheduled_at',
        'started_at',
        'completed_at',
        'status',
        'warranty_claim',
        'cost_amount',
        'currency',
        'notes',
        'resolution',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_at' => 'date',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'warranty_claim' => 'boolean',
            'cost_amount' => 'float',
            'meta' => 'array',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(ItAsset::class, 'asset_id');
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
