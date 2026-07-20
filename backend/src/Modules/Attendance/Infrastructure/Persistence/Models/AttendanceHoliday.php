<?php

namespace Modules\Attendance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceHoliday extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'holiday_date',
        'type',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'holiday_date' => 'date',
        ];
    }

    public function records(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }
}
