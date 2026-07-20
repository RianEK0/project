<?php

namespace Modules\Organization\Application\DTO;

use Shared\Application\DTO\DataTransferObject;

final readonly class TeamData extends DataTransferObject
{
    public function __construct(
        public int $department_id,
        public string $name,
        public string $code,
        public ?string $description,
        public ?int $lead_employee_id,
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            department_id: (int) $payload['department_id'],
            name: $payload['name'],
            code: $payload['code'],
            description: $payload['description'] ?? null,
            lead_employee_id: isset($payload['lead_employee_id']) ? (int) $payload['lead_employee_id'] : null,
        );
    }
}
