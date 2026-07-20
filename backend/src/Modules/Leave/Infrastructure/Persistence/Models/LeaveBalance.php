<?php

namespace Modules\Leave\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class LeaveBalance extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'year',
        'allocated_days',
        'carried_over_days',
        'used_days',
        'pending_days',
        'adjustment_days',
        'meta',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'available_days',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'allocated_days' => 'decimal:2',
            'carried_over_days' => 'decimal:2',
            'used_days' => 'decimal:2',
            'pending_days' => 'decimal:2',
            'adjustment_days' => 'decimal:2',
            'meta' => 'array',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function getAvailableDaysAttribute(): float
    {
        return round(
            (float) $this->allocated_days
            + (float) $this->carried_over_days
            + (float) $this->adjustment_days
            - (float) $this->used_days
            - (float) $this->pending_days,
            2,
        );
    }
}
