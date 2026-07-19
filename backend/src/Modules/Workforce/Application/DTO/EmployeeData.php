<?php

namespace Modules\Workforce\Application\DTO;

use Shared\Application\DTO\DataTransferObject;

final readonly class EmployeeData extends DataTransferObject
{
    /**
     * @param  array<string, mixed>|null  $meta
     */
    public function __construct(
        public string $employee_number,
        public string $first_name,
        public string $last_name,
        public string $work_email,
        public ?string $personal_email,
        public ?string $phone,
        public string $job_title,
        public string $employment_type,
        public string $employment_status,
        public int $department_id,
        public ?int $team_id,
        public ?int $manager_id,
        public ?int $user_id,
        public string $hire_date,
        public ?string $birth_date,
        public ?array $meta,
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            employee_number: $payload['employee_number'],
            first_name: $payload['first_name'],
            last_name: $payload['last_name'],
            work_email: $payload['work_email'],
            personal_email: $payload['personal_email'] ?? null,
            phone: $payload['phone'] ?? null,
            job_title: $payload['job_title'],
            employment_type: $payload['employment_type'],
            employment_status: $payload['employment_status'],
            department_id: (int) $payload['department_id'],
            team_id: isset($payload['team_id']) ? (int) $payload['team_id'] : null,
            manager_id: isset($payload['manager_id']) ? (int) $payload['manager_id'] : null,
            user_id: isset($payload['user_id']) ? (int) $payload['user_id'] : null,
            hire_date: $payload['hire_date'],
            birth_date: $payload['birth_date'] ?? null,
            meta: $payload['meta'] ?? null,
        );
    }
}
