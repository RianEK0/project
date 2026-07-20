<?php

namespace Modules\Leave\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'default_days',
        'deducts_balance',
        'count_weekends',
        'count_holidays',
        'color',
        'requires_attachment',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'deducts_balance' => 'boolean',
            'count_weekends' => 'boolean',
            'count_holidays' => 'boolean',
            'requires_attachment' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function requests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }
}
