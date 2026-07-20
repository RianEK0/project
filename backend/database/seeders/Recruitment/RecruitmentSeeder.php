<?php

namespace Database\Seeders\Recruitment;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentApplication;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentAssessment;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentCandidate;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentInterview;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentVacancy;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;

class RecruitmentSeeder extends Seeder
{
    public function run(): void
    {
        $recruiter = User::query()->where('email', 'bagas.recruitment@enterprise-hris.local')->first()
            ?? User::query()->where('email', 'rafi.saputra@enterprise-hris.local')->first();
        $department = Department::query()->where('code', 'ENG')->first();
        $branch = Branch::query()->where('code', 'BDG-HUB')->first();
        $position = Position::query()->where('code', 'POS-BE')->first();
        $manager = Employee::query()->where('employee_number', 'EMP-0001')->first();

        if (! $recruiter || ! $department || ! $branch) {
            return;
        }

        $backendVacancy = RecruitmentVacancy::query()->updateOrCreate(
            ['code' => 'VAC-1001'],
            [
                'title' => 'Senior Backend Engineer',
                'employment_type' => 'permanent',
                'workplace_type' => 'hybrid',
                'status' => 'open',
                'department_id' => $department->id,
                'branch_id' => $branch->id,
                'position_id' => $position?->id,
                'recruiter_id' => $recruiter->id,
                'hiring_manager_id' => $manager?->id,
                'openings_count' => 2,
                'min_experience_years' => 4,
                'salary_min' => 18000000,
                'salary_max' => 26000000,
                'currency' => 'IDR',
                'publish_date' => '2026-07-01',
                'close_date' => '2026-08-15',
                'description' => 'Lead API delivery, payroll integrations, and platform quality.',
                'requirements' => 'Laravel, distributed systems, testing discipline, and system ownership.',
                'notes' => 'Prioritize candidates with HRIS or fintech background.',
            ],
        );

        $peopleVacancy = RecruitmentVacancy::query()->updateOrCreate(
            ['code' => 'VAC-1002'],
            [
                'title' => 'People Operations Specialist',
                'employment_type' => 'permanent',
                'workplace_type' => 'onsite',
                'status' => 'open',
                'department_id' => Department::query()->where('code', 'HR')->value('id'),
                'branch_id' => Branch::query()->where('code', 'JKT-HQ')->value('id'),
                'recruiter_id' => $recruiter->id,
                'openings_count' => 1,
                'min_experience_years' => 2,
                'salary_min' => 10000000,
                'salary_max' => 15000000,
                'currency' => 'IDR',
                'publish_date' => '2026-07-05',
                'close_date' => '2026-08-10',
                'description' => 'Support employee life-cycle, onboarding, and HR operations reporting.',
                'requirements' => 'People operations experience and strong process communication.',
            ],
        );

        $candidateA = RecruitmentCandidate::query()->updateOrCreate(
            ['email' => 'sinta.rahma@candidate.local'],
            [
                'candidate_code' => 'CAN-2001',
                'full_name' => 'Sinta Rahma',
                'phone' => '+628111111001',
                'source' => 'LinkedIn',
                'location' => 'Bandung',
                'current_company' => 'Cloud Stack Asia',
                'current_position' => 'Backend Engineer',
                'experience_years' => 5,
                'expected_salary' => 23000000,
                'currency' => 'IDR',
                'summary' => 'API engineer with payroll, attendance, and fintech integration exposure.',
                'status' => 'active',
                'last_contacted_at' => now()->subDay(),
            ],
        );

        $candidateB = RecruitmentCandidate::query()->updateOrCreate(
            ['email' => 'farhan.akbar@candidate.local'],
            [
                'candidate_code' => 'CAN-2002',
                'full_name' => 'Farhan Akbar',
                'phone' => '+628111111002',
                'source' => 'Referral',
                'location' => 'Jakarta',
                'current_company' => 'People Loop',
                'current_position' => 'HR Generalist',
                'experience_years' => 3,
                'expected_salary' => 12000000,
                'currency' => 'IDR',
                'summary' => 'Hands-on HR operations specialist with onboarding and policy documentation experience.',
                'status' => 'active',
                'last_contacted_at' => now()->subDays(2),
            ],
        );

        $candidateC = RecruitmentCandidate::query()->updateOrCreate(
            ['email' => 'mika.prasetyo@candidate.local'],
            [
                'candidate_code' => 'CAN-2003',
                'full_name' => 'Mika Prasetyo',
                'phone' => '+628111111003',
                'source' => 'Job Board',
                'location' => 'Yogyakarta',
                'current_company' => 'Nusantara Scale',
                'current_position' => 'Software Engineer',
                'experience_years' => 4,
                'expected_salary' => 21000000,
                'currency' => 'IDR',
                'summary' => 'Strong engineering fundamentals with good communication in interview loops.',
                'status' => 'active',
                'last_contacted_at' => now()->subDays(3),
            ],
        );

        $applicationA = RecruitmentApplication::query()->updateOrCreate(
            ['vacancy_id' => $backendVacancy->id, 'candidate_id' => $candidateA->id],
            [
                'recruiter_id' => $recruiter->id,
                'applied_at' => now()->subDays(6),
                'stage' => 'interview',
                'status' => 'active',
                'rating' => 4.4,
                'notes' => 'Strong API depth and relevant payroll domain context.',
            ],
        );

        $applicationB = RecruitmentApplication::query()->updateOrCreate(
            ['vacancy_id' => $peopleVacancy->id, 'candidate_id' => $candidateB->id],
            [
                'recruiter_id' => $recruiter->id,
                'applied_at' => now()->subDays(4),
                'stage' => 'offer',
                'status' => 'active',
                'rating' => 4.1,
                'offer_sent_at' => now()->subDay(),
                'notes' => 'Ready for final offer review.',
            ],
        );

        $applicationC = RecruitmentApplication::query()->updateOrCreate(
            ['vacancy_id' => $backendVacancy->id, 'candidate_id' => $candidateC->id],
            [
                'recruiter_id' => $recruiter->id,
                'applied_at' => now()->subDays(3),
                'stage' => 'assessment',
                'status' => 'active',
                'rating' => 3.9,
                'notes' => 'Awaiting code assignment review.',
            ],
        );

        RecruitmentInterview::query()->updateOrCreate(
            ['application_id' => $applicationA->id, 'title' => 'Technical Panel Interview'],
            [
                'interview_type' => 'technical',
                'stage' => 'interview',
                'scheduled_at' => now()->addDay()->setTime(10, 0),
                'duration_minutes' => 90,
                'location' => 'Google Meet',
                'interviewer_id' => $recruiter->id,
                'status' => 'scheduled',
                'notes' => 'Focus on architecture and API scaling discussion.',
            ],
        );

        RecruitmentInterview::query()->updateOrCreate(
            ['application_id' => $applicationB->id, 'title' => 'Final HR Alignment'],
            [
                'interview_type' => 'final',
                'stage' => 'offer',
                'scheduled_at' => now()->addDays(2)->setTime(14, 0),
                'duration_minutes' => 45,
                'location' => 'Jakarta HQ',
                'interviewer_id' => $recruiter->id,
                'status' => 'scheduled',
                'notes' => 'Confirm compensation alignment and joining timeline.',
            ],
        );

        RecruitmentAssessment::query()->updateOrCreate(
            ['application_id' => $applicationC->id, 'title' => 'Backend Case Study'],
            [
                'assessment_type' => 'assignment',
                'assigned_at' => now()->subDay(),
                'due_at' => now()->addDays(2),
                'status' => 'submitted',
                'score' => 82,
                'max_score' => 100,
                'result' => 'Awaiting reviewer final verdict',
                'reviewer_id' => $recruiter->id,
                'notes' => 'Submission arrived on time with promising structure.',
            ],
        );
    }
}
