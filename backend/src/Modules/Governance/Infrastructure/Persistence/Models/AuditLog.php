<?php

namespace Modules\Governance\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Str;

class AuditLog extends Model
{
    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'actor_id',
        'auditable_type',
        'auditable_id',
        'action',
        'summary',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'old_values' => 'array',
            'new_values' => 'array',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    public function getBrowserAttribute(): ?string
    {
        if (! is_string($this->user_agent) || $this->user_agent === '') {
            return null;
        }

        $agent = Str::lower($this->user_agent);

        return match (true) {
            Str::contains($agent, 'phpunit') => 'PHPUnit',
            Str::contains($agent, 'postmanruntime') => 'Postman',
            Str::contains($agent, 'curl/') => 'cURL',
            Str::contains($agent, 'edg/') => 'Microsoft Edge',
            Str::contains($agent, 'opr/'), Str::contains($agent, 'opera') => 'Opera',
            Str::contains($agent, 'firefox/') => 'Mozilla Firefox',
            Str::contains($agent, 'chrome/') => 'Google Chrome',
            Str::contains($agent, 'safari/') => 'Safari',
            Str::contains($agent, 'trident/'), Str::contains($agent, 'msie') => 'Internet Explorer',
            default => Str::before($this->user_agent, '/'),
        };
    }
}
