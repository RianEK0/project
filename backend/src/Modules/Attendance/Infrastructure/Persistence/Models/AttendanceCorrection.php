<?php

namespace Modules\Attendance\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class AttendanceCorrection extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'attendance_record_id',
        'employee_id',
        'requested_by',
        'approver_id',
        'reviewed_by',
        'status',
        'requested_attendance_date',
        'requested_clock_in_at',
        'requested_clock_out_at',
        'reason',
        'remarks',
        'acted_at',
        'snapshot_before',
        'snapshot_after',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'requested_attendance_date' => 'date',
            'requested_clock_in_at' => 'datetime',
            'requested_clock_out_at' => 'datetime',
            'acted_at' => 'datetime',
            'snapshot_before' => 'array',
            'snapshot_after' => 'array',
        ];
    }

    public function attendanceRecord(): BelongsTo
    {
        return $this->belongsTo(AttendanceRecord::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
