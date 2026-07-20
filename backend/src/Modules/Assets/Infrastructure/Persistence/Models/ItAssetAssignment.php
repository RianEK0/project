<?php

namespace Modules\Assets\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class ItAssetAssignment extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'asset_id',
        'employee_id',
        'assigned_by',
        'returned_by',
        'assigned_at',
        'expected_return_at',
        'returned_at',
        'assignment_condition',
        'return_condition',
        'assignment_notes',
        'return_notes',
        'status',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'expected_return_at' => 'date',
            'returned_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(ItAsset::class, 'asset_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function returnedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'returned_by');
    }
}
