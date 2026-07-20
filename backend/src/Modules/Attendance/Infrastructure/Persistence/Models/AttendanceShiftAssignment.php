<?php

namespace Modules\Attendance\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class AttendanceShiftAssignment extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'attendance_shift_id',
        'start_date',
        'end_date',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
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
}
