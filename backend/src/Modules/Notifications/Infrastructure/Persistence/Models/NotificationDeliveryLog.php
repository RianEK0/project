<?php

namespace Modules\Notifications\Infrastructure\Persistence\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationDeliveryLog extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'recipient_user_id',
        'sent_by',
        'source',
        'channel',
        'notification_type',
        'subject',
        'title',
        'message',
        'recipient',
        'status',
        'transport_mode',
        'notification_uuid',
        'payload',
        'sent_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
