<?php

namespace Modules\Workforce\Application\DTO;

use Illuminate\Support\Arr;
use Shared\Application\DTO\DataTransferObject;

final readonly class EmployeeData extends DataTransferObject
{
    /**
     * @param  array<int, string>  $provided_fields
     * @param  array<int, array<string, mixed>>|null  $family
     * @param  array<int, array<string, mixed>>|null  $emergency_contacts
     * @param  array<int, array<string, mixed>>|null  $educations
     * @param  array<int, array<string, mixed>>|null  $experiences
     * @param  array<int, array<string, mixed>>|null  $skills
     * @param  array<int, array<string, mixed>>|null  $certifications
     * @param  array<int, array<string, mixed>>|null  $bank_accounts
     * @param  array<int, array<string, mixed>>|null  $salary_histories
     * @param  array<int, array<string, mixed>>|null  $contracts
     * @param  array<string, mixed>|null  $meta
     */
    public function __construct(
        public array $provided_fields,
        public string $employee_number,
        public string $first_name,
        public ?string $middle_name,
        public string $last_name,
        public ?string $preferred_name,
        public string $work_email,
        public ?string $personal_email,
        public ?string $phone,
        public ?string $gender,
        public ?string $marital_status,
        public ?string $place_of_birth,
        public ?string $address,
        public ?string $city,
        public ?string $state,
        public ?string $postal_code,
        public ?string $country,
        public ?string $identity_card_number,
        public ?string $passport_number,
        public ?string $passport_expiry_date,
        public ?string $npwp_number,
        public ?string $bpjs_health_number,
        public ?string $bpjs_employment_number,
        public string $job_title,
        public string $employment_type,
        public string $employment_status,
        public int $department_id,
        public ?int $branch_id,
        public ?int $team_id,
        public ?int $division_id,
        public ?int $section_id,
        public ?int $position_id,
        public ?int $manager_id,
        public ?int $user_id,
        public string $hire_date,
        public ?string $birth_date,
        public ?array $family,
        public ?array $emergency_contacts,
        public ?array $educations,
        public ?array $experiences,
        public ?array $skills,
        public ?array $certifications,
        public ?array $bank_accounts,
        public ?array $salary_histories,
        public ?array $contracts,
        public ?array $meta,
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public static function fromArray(array $payload): self
    {
        return new self(
            provided_fields: array_keys($payload),
            employee_number: $payload['employee_number'] ?? $payload['employee_code'],
            first_name: $payload['first_name'],
            middle_name: $payload['middle_name'] ?? null,
            last_name: $payload['last_name'],
            preferred_name: $payload['preferred_name'] ?? null,
            work_email: $payload['work_email'],
            personal_email: $payload['personal_email'] ?? null,
            phone: $payload['phone'] ?? null,
            gender: $payload['gender'] ?? null,
            marital_status: $payload['marital_status'] ?? null,
            place_of_birth: $payload['place_of_birth'] ?? null,
            address: $payload['address'] ?? null,
            city: $payload['city'] ?? null,
            state: $payload['state'] ?? null,
            postal_code: $payload['postal_code'] ?? null,
            country: $payload['country'] ?? null,
            identity_card_number: $payload['identity_card_number'] ?? null,
            passport_number: $payload['passport_number'] ?? null,
            passport_expiry_date: $payload['passport_expiry_date'] ?? null,
            npwp_number: $payload['npwp_number'] ?? null,
            bpjs_health_number: $payload['bpjs_health_number'] ?? null,
            bpjs_employment_number: $payload['bpjs_employment_number'] ?? null,
            job_title: $payload['job_title'],
            employment_type: $payload['employment_type'],
            employment_status: $payload['employment_status'],
            department_id: (int) $payload['department_id'],
            branch_id: isset($payload['branch_id']) ? (int) $payload['branch_id'] : null,
            team_id: isset($payload['team_id']) ? (int) $payload['team_id'] : null,
            division_id: isset($payload['division_id']) ? (int) $payload['division_id'] : null,
            section_id: isset($payload['section_id']) ? (int) $payload['section_id'] : null,
            position_id: isset($payload['position_id']) ? (int) $payload['position_id'] : null,
            manager_id: isset($payload['manager_id']) ? (int) $payload['manager_id'] : null,
            user_id: isset($payload['user_id']) ? (int) $payload['user_id'] : null,
            hire_date: $payload['hire_date'],
            birth_date: $payload['birth_date'] ?? null,
            family: $payload['family'] ?? null,
            emergency_contacts: $payload['emergency_contacts'] ?? null,
            educations: $payload['educations'] ?? null,
            experiences: $payload['experiences'] ?? null,
            skills: $payload['skills'] ?? null,
            certifications: $payload['certifications'] ?? null,
            bank_accounts: $payload['bank_accounts'] ?? null,
            salary_histories: $payload['salary_histories'] ?? null,
            contracts: $payload['contracts'] ?? null,
            meta: $payload['meta'] ?? null,
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function employeeAttributes(): array
    {
        $attributes = [
            'employee_number' => $this->employee_number,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'preferred_name' => $this->preferred_name,
            'work_email' => $this->work_email,
            'personal_email' => $this->personal_email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'marital_status' => $this->marital_status,
            'place_of_birth' => $this->place_of_birth,
            'address' => $this->address,
            'city' => $this->city,
            'state' => $this->state,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'identity_card_number' => $this->identity_card_number,
            'passport_number' => $this->passport_number,
            'passport_expiry_date' => $this->passport_expiry_date,
            'npwp_number' => $this->npwp_number,
            'bpjs_health_number' => $this->bpjs_health_number,
            'bpjs_employment_number' => $this->bpjs_employment_number,
            'job_title' => $this->job_title,
            'employment_type' => $this->employment_type,
            'employment_status' => $this->employment_status,
            'department_id' => $this->department_id,
            'branch_id' => $this->branch_id,
            'team_id' => $this->team_id,
            'division_id' => $this->division_id,
            'section_id' => $this->section_id,
            'position_id' => $this->position_id,
            'manager_id' => $this->manager_id,
            'user_id' => $this->user_id,
            'hire_date' => $this->hire_date,
            'birth_date' => $this->birth_date,
            'family' => $this->family,
            'emergency_contacts' => $this->emergency_contacts,
            'educations' => $this->educations,
            'experiences' => $this->experiences,
            'skills' => $this->skills,
            'certifications' => $this->certifications,
            'bank_accounts' => $this->bank_accounts,
            'meta' => $this->meta,
        ];

        return Arr::only($attributes, array_values(array_intersect(array_keys($attributes), $this->provided_fields)));
    }

    public function hasField(string $field): bool
    {
        return in_array($field, $this->provided_fields, true);
    }
}
