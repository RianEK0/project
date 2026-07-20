<?php

namespace Modules\Attendance\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class AttendanceRecord extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'attendance_shift_id',
        'attendance_holiday_id',
        'attendance_date',
        'status',
        'clock_in_at',
        'clock_out_at',
        'clock_in_latitude',
        'clock_in_longitude',
        'clock_out_latitude',
        'clock_out_longitude',
        'clock_in_source',
        'clock_out_source',
        'clock_in_photo_path',
        'clock_out_photo_path',
        'is_late',
        'late_minutes',
        'is_overtime',
        'overtime_minutes',
        'worked_minutes',
        'is_weekend',
        'is_holiday',
        'is_corrected',
        'notes',
        'created_by',
        'updated_by',
        'meta',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'clock_in_photo_url',
        'clock_out_photo_url',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'clock_in_at' => 'datetime',
            'clock_out_at' => 'datetime',
            'clock_in_latitude' => 'float',
            'clock_in_longitude' => 'float',
            'clock_out_latitude' => 'float',
            'clock_out_longitude' => 'float',
            'is_late' => 'boolean',
            'late_minutes' => 'integer',
            'is_overtime' => 'boolean',
            'overtime_minutes' => 'integer',
            'worked_minutes' => 'integer',
            'is_weekend' => 'boolean',
            'is_holiday' => 'boolean',
            'is_corrected' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(AttendanceShift::class, 'attendance_shift_id');
    }

    public function holiday(): BelongsTo
    {
        return $this->belongsTo(AttendanceHoliday::class, 'attendance_holiday_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function corrections(): HasMany
    {
        return $this->hasMany(AttendanceCorrection::class)->latest();
    }

    public function getClockInPhotoUrlAttribute(): ?string
    {
        if (! $this->clock_in_photo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->clock_in_photo_path);
    }

    public function getClockOutPhotoUrlAttribute(): ?string
    {
        if (! $this->clock_out_photo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->clock_out_photo_path);
    }
}
