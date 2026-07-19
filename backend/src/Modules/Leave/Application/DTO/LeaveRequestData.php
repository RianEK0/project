<?php

namespace Modules\Leave\Application\DTO;

use Shared\Application\DTO\DataTransferObject;

final readonly class LeaveRequestData extends DataTransferObject
{
    public function __construct(
        public int $leave_type_id,
        public string $start_date,
        public string $end_date,
        public string $reason,
        public ?array $meta,
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            leave_type_id: (int) $payload['leave_type_id'],
            start_date: $payload['start_date'],
            end_date: $payload['end_date'],
            reason: $payload['reason'],
            meta: $payload['meta'] ?? null,
        );
    }
}
