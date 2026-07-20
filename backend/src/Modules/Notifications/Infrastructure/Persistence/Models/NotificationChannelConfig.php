<?php

namespace Modules\Notifications\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationChannelConfig extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'channel',
        'label',
        'driver',
        'transport_mode',
        'is_enabled',
        'description',
        'config',
        'last_tested_at',
        'updated_by',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
            'last_tested_at' => 'datetime',
        ];
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
