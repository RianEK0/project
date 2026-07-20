<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Organization\Infrastructure\Persistence\Models\Team;

class Department extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'cost_center',
        'head_employee_id',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function divisions(): HasMany
    {
        return $this->hasMany(Division::class);
    }

    public function head(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'head_employee_id');
    }
}
