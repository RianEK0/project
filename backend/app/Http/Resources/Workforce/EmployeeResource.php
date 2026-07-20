<?php

namespace App\Http\Resources\Workforce;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $salaryHistories = $this->relationLoaded('salaryHistories')
            ? $this->salaryHistories->map(static fn ($salary): array => [
                'id' => $salary->id,
                'component' => $salary->component,
                'amount' => (float) $salary->amount,
                'currency' => $salary->currency,
                'pay_frequency' => $salary->pay_frequency,
                'effective_date' => $salary->effective_date?->toDateString(),
                'end_date' => $salary->end_date?->toDateString(),
                'is_current' => $salary->is_current,
                'notes' => $salary->notes,
                'meta' => $salary->meta,
            ])->all()
            : [];

        $contracts = $this->relationLoaded('contracts')
            ? $this->contracts->map(static fn ($contract): array => [
                'id' => $contract->id,
                'contract_type' => $contract->contract_type,
                'contract_number' => $contract->contract_number,
                'start_date' => $contract->start_date?->toDateString(),
                'end_date' => $contract->end_date?->toDateString(),
                'status' => $contract->status,
                'terms' => $contract->terms,
                'notes' => $contract->notes,
                'meta' => $contract->meta,
            ])->all()
            : [];

        $documents = $this->relationLoaded('documents')
            ? $this->documents->map(static fn ($document): array => [
                'id' => $document->id,
                'category' => $document->category,
                'label' => $document->label,
                'file_name' => $document->file_name,
                'file_url' => $document->file_url,
                'mime_type' => $document->mime_type,
                'file_size' => $document->file_size,
                'issued_at' => $document->issued_at?->toDateString(),
                'expires_at' => $document->expires_at?->toDateString(),
                'notes' => $document->notes,
                'uploaded_by' => $document->uploadedBy ? [
                    'id' => $document->uploadedBy->id,
                    'name' => $document->uploadedBy->name,
                    'email' => $document->uploadedBy->email,
                ] : null,
                'created_at' => $document->created_at,
            ])->all()
            : [];

        return [
            'id' => $this->id,
            'employee_number' => $this->employee_number,
            'employee_code' => $this->employee_number,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'preferred_name' => $this->preferred_name,
            'full_name' => $this->full_name,
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
            'photo_url' => $this->photo_url,
            'identity_card_number' => $this->identity_card_number,
            'passport_number' => $this->passport_number,
            'passport_expiry_date' => $this->passport_expiry_date?->toDateString(),
            'npwp_number' => $this->npwp_number,
            'bpjs_health_number' => $this->bpjs_health_number,
            'bpjs_employment_number' => $this->bpjs_employment_number,
            'job_title' => $this->job_title,
            'employment_type' => $this->employment_type,
            'employment_status' => $this->employment_status,
            'hire_date' => $this->hire_date?->toDateString(),
            'birth_date' => $this->birth_date?->toDateString(),
            'branch' => $this->branch ? [
                'id' => $this->branch->id,
                'name' => $this->branch->name,
                'code' => $this->branch->code,
            ] : null,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ] : null,
            'division' => $this->division ? [
                'id' => $this->division->id,
                'name' => $this->division->name,
                'code' => $this->division->code,
            ] : null,
            'section' => $this->section ? [
                'id' => $this->section->id,
                'name' => $this->section->name,
                'code' => $this->section->code,
            ] : null,
            'position' => $this->position ? [
                'id' => $this->position->id,
                'name' => $this->position->name,
                'code' => $this->position->code,
                'grade' => $this->position->grade,
            ] : null,
            'team' => $this->team ? [
                'id' => $this->team->id,
                'name' => $this->team->name,
                'code' => $this->team->code,
            ] : null,
            'manager' => $this->manager ? [
                'id' => $this->manager->id,
                'employee_number' => $this->manager->employee_number,
                'full_name' => $this->manager->full_name,
            ] : null,
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,
            'family' => $this->family ?? [],
            'emergency_contacts' => $this->emergency_contacts ?? [],
            'educations' => $this->educations ?? [],
            'experiences' => $this->experiences ?? [],
            'skills' => $this->skills ?? [],
            'certifications' => $this->certifications ?? [],
            'bank_accounts' => $this->bank_accounts ?? [],
            'salary_histories' => $salaryHistories,
            'contracts' => $contracts,
            'documents' => $documents,
            'history' => $this->historyTimeline($salaryHistories, $contracts, $documents),
            'meta' => $this->meta,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $salaryHistories
     * @param  array<int, array<string, mixed>>  $contracts
     * @param  array<int, array<string, mixed>>  $documents
     * @return array<int, array<string, mixed>>
     */
    private function historyTimeline(array $salaryHistories, array $contracts, array $documents): array
    {
        $events = [];

        if ($this->hire_date) {
            $events[] = [
                'type' => 'employment',
                'title' => 'Employee onboarded',
                'description' => "Joined as {$this->job_title}.",
                'date' => $this->hire_date->toDateString(),
            ];
        }

        foreach ($salaryHistories as $salary) {
            $events[] = [
                'type' => 'salary',
                'title' => $salary['component'].' updated',
                'description' => $salary['currency'].' '.number_format((float) $salary['amount'], 2),
                'date' => $salary['effective_date'],
            ];
        }

        foreach ($contracts as $contract) {
            $events[] = [
                'type' => 'contract',
                'title' => $contract['contract_type'].' contract',
                'description' => $contract['status'],
                'date' => $contract['start_date'],
            ];
        }

        foreach ($documents as $document) {
            $events[] = [
                'type' => 'document',
                'title' => $document['label'],
                'description' => 'Document uploaded',
                'date' => $document['created_at']?->toDateString() ?? $document['created_at'],
            ];
        }

        usort($events, static fn (array $left, array $right): int => strcmp((string) $right['date'], (string) $left['date']));

        return $events;
    }
}
