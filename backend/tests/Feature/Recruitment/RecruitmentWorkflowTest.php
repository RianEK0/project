<?php

namespace Tests\Feature\Recruitment;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentApplication;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentCandidate;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentVacancy;
use Modules\Workforce\Infrastructure\Persistence\Models\Branch;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Position;
use Tests\TestCase;

class RecruitmentWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_recruitment_officer_can_create_vacancy_and_candidate_with_cv(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);

        $department = Department::query()->where('code', 'ENG')->firstOrFail();
        $branch = Branch::query()->where('code', 'BDG-HUB')->firstOrFail();
        $position = Position::query()->where('code', 'POS-BE')->firstOrFail();

        $vacancyResponse = $this->postJson('/api/v1/recruitment/vacancies', [
            'title' => 'Platform Reliability Engineer',
            'employment_type' => 'permanent',
            'workplace_type' => 'hybrid',
            'status' => 'open',
            'department_id' => $department->id,
            'branch_id' => $branch->id,
            'position_id' => $position->id,
            'openings_count' => 1,
            'min_experience_years' => 3,
            'salary_min' => 17000000,
            'salary_max' => 24000000,
            'publish_date' => '2026-07-19',
            'close_date' => '2026-08-30',
            'description' => 'Own reliability, incident response, and platform resilience.',
            'requirements' => 'Strong observability and backend systems experience.',
        ], $this->authenticateEmail('bagas.recruitment@enterprise-hris.local'));

        $vacancyResponse
            ->assertCreated()
            ->assertJsonPath('data.title', 'Platform Reliability Engineer')
            ->assertJsonPath('data.department.code', 'ENG');

        $vacancyId = $vacancyResponse->json('data.id');

        $candidateResponse = $this->post('/api/v1/recruitment/candidates', [
            'full_name' => 'Dea Maharani',
            'email' => 'dea.maharani@candidate.local',
            'phone' => '+6281211111111',
            'source' => 'LinkedIn',
            'location' => 'Bandung',
            'current_company' => 'Scale Forge',
            'current_position' => 'SRE Engineer',
            'experience_years' => 4,
            'expected_salary' => 22000000,
            'currency' => 'IDR',
            'summary' => 'SRE with backend and infrastructure automation background.',
            'vacancy_id' => $vacancyId,
            'cv' => UploadedFile::fake()->create('dea-maharani-cv.pdf', 180, 'application/pdf'),
        ], [
            'Accept' => 'application/json',
            ...$this->authenticateEmail('bagas.recruitment@enterprise-hris.local'),
        ]);

        $candidateResponse
            ->assertCreated()
            ->assertJsonPath('data.full_name', 'Dea Maharani')
            ->assertJsonPath('data.applications.0.vacancy.id', $vacancyId)
            ->assertJsonPath('data.cv_file_name', 'dea-maharani-cv.pdf');

        $candidate = RecruitmentCandidate::query()->where('email', 'dea.maharani@candidate.local')->firstOrFail();

        $this->assertNotNull($candidate->cv_path);
        Storage::disk('public')->assertExists($candidate->cv_path);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.vacancy.created',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.candidate.created',
        ]);
    }

    public function test_recruitment_overview_and_pipeline_reflect_interview_and_assessment_updates(): void
    {
        $this->seed(DatabaseSeeder::class);

        $application = RecruitmentApplication::query()
            ->where('stage', 'interview')
            ->firstOrFail();

        $this->postJson("/api/v1/recruitment/applications/{$application->id}/interviews", [
            'title' => 'System Design Interview',
            'interview_type' => 'technical',
            'scheduled_at' => '2026-07-21 11:00:00',
            'duration_minutes' => 60,
            'location' => 'Google Meet',
            'notes' => 'Cover scaling and distributed job processing.',
        ], $this->authenticateEmail('bagas.recruitment@enterprise-hris.local'))
            ->assertCreated()
            ->assertJsonPath('data.title', 'System Design Interview');

        $assessmentResponse = $this->postJson("/api/v1/recruitment/applications/{$application->id}/assessments", [
            'title' => 'Architecture Take-home Review',
            'assessment_type' => 'assignment',
            'assigned_at' => '2026-07-19 10:00:00',
            'due_at' => '2026-07-23 17:00:00',
            'completed_at' => '2026-07-20 17:00:00',
            'status' => 'passed',
            'score' => 91,
            'max_score' => 100,
            'result' => 'Strong hire',
            'notes' => 'Well-structured design and clear tradeoff explanation.',
        ], $this->authenticateEmail('bagas.recruitment@enterprise-hris.local'));

        $assessmentResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'passed');

        $overviewResponse = $this->getJson('/api/v1/recruitment/overview', $this->authenticateEmail('bagas.recruitment@enterprise-hris.local'));

        $overviewResponse
            ->assertOk()
            ->assertJsonPath('data.stats.open_vacancies', 2)
            ->assertJsonFragment([
                'stage' => 'assessment',
            ])
            ->assertJsonFragment([
                'title' => 'System Design Interview',
            ]);

        $scheduleResponse = $this->getJson('/api/v1/recruitment/interviews/schedule?start_date=2026-07-20&end_date=2026-07-25', $this->authenticateEmail('bagas.recruitment@enterprise-hris.local'));

        $scheduleResponse
            ->assertOk()
            ->assertJsonFragment([
                'title' => 'System Design Interview',
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.interview.scheduled',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.assessment.recorded',
        ]);
    }

    public function test_hiring_candidate_creates_employee_and_marks_application_hired(): void
    {
        $this->seed(DatabaseSeeder::class);

        $application = RecruitmentApplication::query()
            ->where('stage', 'offer')
            ->firstOrFail();

        $response = $this->postJson("/api/v1/recruitment/applications/{$application->id}/hire", [
            'hire_date' => '2026-07-21',
            'employment_type' => 'permanent',
            'job_title' => 'People Operations Specialist',
            'base_salary' => 12500000,
            'salary_currency' => 'IDR',
            'notes' => 'Joining after final offer confirmation.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $response
            ->assertOk()
            ->assertJsonPath('data.stage', 'hired')
            ->assertJsonPath('data.status', 'hired')
            ->assertJsonPath('data.hired_employee.department', 'Human Resources');

        $employeeNumber = $response->json('data.hired_employee.employee_number');

        $this->assertDatabaseHas('employees', [
            'employee_number' => $employeeNumber,
            'personal_email' => 'farhan.akbar@candidate.local',
            'job_title' => 'People Operations Specialist',
        ]);

        $this->assertDatabaseHas('employee_salary_histories', [
            'employee_id' => $response->json('data.hired_employee.id'),
            'component' => 'Base Salary',
        ]);

        $vacancy = RecruitmentVacancy::query()->where('code', 'VAC-1002')->firstOrFail();

        $this->assertSame('filled', $vacancy->status);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.candidate.hired',
        ]);
    }

    public function test_user_without_recruitment_permission_cannot_view_recruitment_workspace(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->getJson('/api/v1/recruitment/overview', $this->authenticateEmail('nadia.putri@enterprise-hris.local'))
            ->assertForbidden();
    }
}
