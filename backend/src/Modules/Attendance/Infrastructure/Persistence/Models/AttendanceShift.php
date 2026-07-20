<?php

namespace Modules\Attendance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceShift extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'start_time',
        'end_time',
        'grace_minutes',
        'requires_gps',
        'requires_photo',
        'requires_qr',
        'latitude',
        'longitude',
        'radius_meters',
        'qr_token',
        'is_active',
        'meta',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'grace_minutes' => 'integer',
            'requires_gps' => 'boolean',
            'requires_photo' => 'boolean',
            'requires_qr' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
            'radius_meters' => 'integer',
            'is_active' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(AttendanceShiftAssignment::class);
    }

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
