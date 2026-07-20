<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Position extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'division_id',
        'section_id',
        'name',
        'code',
        'grade',
        'description',
    ];

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
