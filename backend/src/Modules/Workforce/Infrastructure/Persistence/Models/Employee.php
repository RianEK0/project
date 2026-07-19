<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveRequest;
use Modules\Organization\Infrastructure\Persistence\Models\Team;

class Employee extends Model
{
    use SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_number',
        'first_name',
        'last_name',
        'work_email',
        'personal_email',
        'phone',
        'job_title',
        'employment_type',
        'employment_status',
        'department_id',
        'team_id',
        'manager_id',
        'user_id',
        'hire_date',
        'birth_date',
        'meta',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'full_name',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'birth_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }
}
