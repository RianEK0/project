<?php

namespace Modules\Workforce\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class EmployeeDocument extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'employee_id',
        'uploaded_by',
        'category',
        'label',
        'disk',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'issued_at',
        'expires_at',
        'notes',
    ];

    /**
     * @var list<string>
     */
    protected $appends = [
        'file_url',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_at' => 'date',
            'expires_at' => 'date',
            'file_size' => 'integer',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->file_path);
    }
}
