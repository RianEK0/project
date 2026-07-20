<?php

namespace Tests\Feature\Performance;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceGoal;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceReview;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class PerformanceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_hr_manager_can_create_cycle_goal_and_review(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $cycleResponse = $this->postJson('/api/v1/performance/cycles', [
            'name' => 'Q4 2026 Performance Cycle',
            'review_type' => 'quarterly',
            'period_start' => '2026-10-01',
            'period_end' => '2026-12-31',
            'status' => 'draft',
            'description' => 'Quarterly performance cycle for the last quarter of 2026.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $cycleResponse
            ->assertCreated()
            ->assertJsonPath('data.name', 'Q4 2026 Performance Cycle')
            ->assertJsonPath('data.status', 'draft');

        $cycleId = $cycleResponse->json('data.id');

        $goalResponse = $this->postJson('/api/v1/performance/goals', [
            'cycle_id' => $cycleId,
            'employee_id' => $employee->id,
            'title' => 'Increase automated regression coverage for HRIS services',
            'goal_type' => 'okr',
            'category' => 'Quality',
            'target_value' => 85,
            'current_value' => 20,
            'unit' => '%',
            'weight' => 35,
            'due_date' => '2026-12-15',
            'notes' => 'Coordinate with payroll and attendance module owners.',
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $goalResponse
            ->assertCreated()
            ->assertJsonPath('data.goal_type', 'okr')
            ->assertJsonPath('data.employee.employee_number', 'EMP-0003');

        $reviewResponse = $this->postJson('/api/v1/performance/reviews', [
            'cycle_id' => $cycleId,
            'employee_id' => $employee->id,
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $reviewResponse
            ->assertCreated()
            ->assertJsonPath('data.employee.employee_number', 'EMP-0003')
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.cycle.created',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.goal.created',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.review.created',
        ]);
    }

    public function test_employee_and_manager_can_progress_goal_submit_reviews_and_record_feedback(): void
    {
        $this->seed(DatabaseSeeder::class);

        $goal = PerformanceGoal::query()
            ->where('title', 'Reduce onboarding workflow lead time')
            ->firstOrFail();

        $this->postJson("/api/v1/performance/goals/{$goal->id}/update", [
            'current_value' => 3.5,
            'progress_percent' => 87.5,
            'status' => 'on_track',
            'notes' => 'Workflow automation now covers recruitment handoff and manager approval reminders.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'))
            ->assertOk()
            ->assertJsonPath('data.progress_percent', 87.5);

        $review = PerformanceReview::query()
            ->whereHas('cycle', fn ($query) => $query->where('code', 'PRF-2026-Q3'))
            ->whereHas('employee', fn ($query) => $query->where('employee_number', 'EMP-0003'))
            ->firstOrFail();

        $this->postJson("/api/v1/performance/reviews/{$review->id}/employee-review", [
            'employee_review_summary' => 'I improved reliability work and made onboarding workflow automation much more predictable this quarter.',
            'employee_review_highlights' => 'Delivered stronger observability and shortened approval handoff time.',
            'employee_review_challenges' => 'Still improving clarity when presenting architecture tradeoffs to non-engineering partners.',
            'employee_rating' => 4.4,
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'))
            ->assertOk()
            ->assertJsonPath('data.status', 'employee_submitted');

        $managerReviewResponse = $this->postJson("/api/v1/performance/reviews/{$review->id}/manager-review", [
            'manager_review_summary' => 'Nadia delivered steady execution and showed visible growth in cross-functional ownership.',
            'manager_review_strengths' => 'Strong delivery discipline and improving architectural judgment.',
            'manager_review_improvements' => 'Document design tradeoffs earlier and drive more proactive review alignment.',
            'manager_rating' => 4.6,
            'overall_score' => 4.5,
            'overall_rating' => 'Outstanding',
            'calibration_notes' => 'Ready to take a broader backend ownership surface next quarter.',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $managerReviewResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'completed')
            ->assertJsonPath('data.overall_rating', 'Outstanding');

        $feedbackResponse = $this->postJson("/api/v1/performance/reviews/{$review->id}/feedback", [
            'feedback_type' => 'stakeholder',
            'relationship' => 'HR partner for workflow automation',
            'strengths' => 'Reliable collaboration and fast iteration.',
            'improvements' => 'Share release risk even earlier during change planning.',
            'comments' => 'Automation rollout coordination stayed smooth and transparent.',
            'rating' => 4.2,
        ], $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $feedbackResponse
            ->assertCreated()
            ->assertJsonPath('data.feedback_type', 'stakeholder');

        $overviewResponse = $this->getJson('/api/v1/performance/overview', $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $overviewResponse
            ->assertOk()
            ->assertJsonFragment([
                'status' => 'completed',
            ])
            ->assertJsonFragment([
                'goal_type' => 'okr',
            ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.goal.updated',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.employee_review.submitted',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.manager_review.submitted',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'performance.feedback.recorded',
        ]);
    }

    public function test_user_without_performance_permission_cannot_view_performance_workspace(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->getJson('/api/v1/performance/overview', $this->authenticateEmail('nara.support@enterprise-hris.local'))
            ->assertForbidden();
    }
}
