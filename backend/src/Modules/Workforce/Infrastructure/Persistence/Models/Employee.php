<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
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
        'middle_name',
        'last_name',
        'preferred_name',
        'work_email',
        'personal_email',
        'phone',
        'gender',
        'marital_status',
        'place_of_birth',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'photo_path',
        'identity_card_number',
        'passport_number',
        'passport_expiry_date',
        'npwp_number',
        'bpjs_health_number',
        'bpjs_employment_number',
        'job_title',
        'employment_type',
        'employment_status',
        'department_id',
        'branch_id',
        'team_id',
        'division_id',
        'section_id',
        'position_id',
        'manager_id',
        'user_id',
        'hire_date',
        'birth_date',
        'meta',
        'family',
        'emergency_contacts',
        'educations',
        'experiences',
        'skills',
        'certifications',
        'bank_accounts',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'full_name',
        'photo_url',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hire_date' => 'date',
            'birth_date' => 'date',
            'passport_expiry_date' => 'date',
            'meta' => 'array',
            'family' => 'array',
            'emergency_contacts' => 'array',
            'educations' => 'array',
            'experiences' => 'array',
            'skills' => 'array',
            'certifications' => 'array',
            'bank_accounts' => 'array',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(self::class, 'manager_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
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

    public function salaryHistories(): HasMany
    {
        return $this->hasMany(EmployeeSalaryHistory::class)
            ->orderByDesc('is_current')
            ->orderByRaw("CASE WHEN LOWER(component) LIKE '%base salary%' THEN 0 ELSE 1 END")
            ->orderByDesc('effective_date')
            ->orderByDesc('id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(EmployeeContract::class)->orderByDesc('start_date')->orderByDesc('id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(EmployeeDocument::class)->latest();
    }

    public function getFullNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->first_name,
            $this->middle_name,
            $this->last_name,
        ])));
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (! $this->photo_path) {
            return null;
        }

        return Storage::disk('public')->url($this->photo_path);
    }
}
