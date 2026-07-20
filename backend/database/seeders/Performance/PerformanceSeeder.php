<?php

namespace Database\Seeders\Performance;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceCycle;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceFeedback;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceGoal;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceReview;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class PerformanceSeeder extends Seeder
{
    public function run(): void
    {
        $alya = Employee::query()->where('employee_number', 'EMP-0001')->firstOrFail();
        $rafi = Employee::query()->where('employee_number', 'EMP-0002')->firstOrFail();
        $nadia = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $hrManager = User::query()->where('email', 'rafi.saputra@enterprise-hris.local')->first();
        $departmentManager = User::query()->where('email', 'alya.pratama@enterprise-hris.local')->first();

        $closedCycle = PerformanceCycle::query()->updateOrCreate(
            ['code' => 'PRF-2026-H1'],
            [
                'name' => 'Mid-year 2026 Performance Review',
                'review_type' => 'mid_year',
                'period_start' => '2026-01-01',
                'period_end' => '2026-06-30',
                'status' => 'closed',
                'description' => 'Mid-year checkpoint for delivery, collaboration, and role growth.',
                'created_by' => $hrManager?->id,
                'meta' => [
                    'focus' => 'Mid-year calibration',
                ],
            ],
        );

        $activeCycle = PerformanceCycle::query()->updateOrCreate(
            ['code' => 'PRF-2026-Q3'],
            [
                'name' => 'Q3 2026 Performance Cycle',
                'review_type' => 'quarterly',
                'period_start' => '2026-07-01',
                'period_end' => '2026-09-30',
                'status' => 'active',
                'description' => 'Quarterly cycle covering KPI delivery, OKR progress, and manager coaching notes.',
                'created_by' => $hrManager?->id,
                'meta' => [
                    'focus' => 'Execution and growth',
                ],
            ],
        );

        PerformanceGoal::query()->updateOrCreate(
            [
                'cycle_id' => $activeCycle->id,
                'employee_id' => $nadia->id,
                'title' => 'Maintain core API availability above 99.95%',
            ],
            [
                'manager_id' => $alya->id,
                'goal_type' => 'kpi',
                'category' => 'Reliability',
                'description' => 'Keep payroll, attendance, and leave APIs healthy through stronger alerting and runbook coverage.',
                'target_value' => 99.95,
                'current_value' => 99.82,
                'unit' => '%',
                'weight' => 40,
                'progress_percent' => 72.5,
                'status' => 'on_track',
                'due_date' => '2026-09-30',
                'notes' => 'SLO burn alerting already improved after payroll release.',
                'meta' => [
                    'theme' => 'stability',
                ],
            ],
        );

        PerformanceGoal::query()->updateOrCreate(
            [
                'cycle_id' => $activeCycle->id,
                'employee_id' => $nadia->id,
                'title' => 'Reduce onboarding workflow lead time',
            ],
            [
                'manager_id' => $alya->id,
                'goal_type' => 'okr',
                'category' => 'Automation',
                'description' => 'Shorten employee onboarding request turnaround by automating approval and provisioning touchpoints.',
                'target_value' => 4,
                'current_value' => 2.5,
                'unit' => 'weeks',
                'weight' => 35,
                'progress_percent' => 62.5,
                'status' => 'on_track',
                'due_date' => '2026-09-15',
                'notes' => 'Recruitment to workforce handoff is already partially automated.',
            ],
        );

        PerformanceGoal::query()->updateOrCreate(
            [
                'cycle_id' => $activeCycle->id,
                'employee_id' => $alya->id,
                'title' => 'Coach backend engineers through incident leadership',
            ],
            [
                'manager_id' => null,
                'goal_type' => 'goal',
                'category' => 'Leadership',
                'description' => 'Run structured incident reviews and build stronger delegation during high-severity incidents.',
                'target_value' => 3,
                'current_value' => 2,
                'unit' => 'sessions',
                'weight' => 25,
                'progress_percent' => 66.67,
                'status' => 'on_track',
                'due_date' => '2026-09-20',
                'notes' => 'Two coaching sessions completed with engineering ICs.',
            ],
        );

        PerformanceGoal::query()->updateOrCreate(
            [
                'cycle_id' => $activeCycle->id,
                'employee_id' => $rafi->id,
                'title' => 'Raise HR policy adoption across managers',
            ],
            [
                'manager_id' => null,
                'goal_type' => 'kpi',
                'category' => 'Enablement',
                'description' => 'Increase usage of leave, attendance, and probation review workflows through manager enablement.',
                'target_value' => 90,
                'current_value' => 68,
                'unit' => '%',
                'weight' => 30,
                'progress_percent' => 75.56,
                'status' => 'on_track',
                'due_date' => '2026-09-25',
                'notes' => 'Manager enablement sessions are scheduled every two weeks.',
            ],
        );

        $completedReview = PerformanceReview::query()->updateOrCreate(
            [
                'cycle_id' => $closedCycle->id,
                'employee_id' => $nadia->id,
            ],
            [
                'manager_id' => $alya->id,
                'creator_id' => $hrManager?->id,
                'overall_score' => 4.35,
                'overall_rating' => 'Exceeds Expectations',
                'status' => 'completed',
                'employee_review_summary' => 'Delivered reliably across payroll and attendance integrations while growing in incident ownership.',
                'employee_review_highlights' => 'Improved API observability and handled two cross-team delivery milestones.',
                'employee_review_challenges' => 'Needs more confidence when leading larger rollout communication.',
                'employee_rating' => 4.2,
                'employee_submitted_at' => '2026-06-20 10:30:00',
                'manager_review_summary' => 'Consistently dependable execution with clear growth in systems thinking.',
                'manager_review_strengths' => 'Strong ownership, clean backend design, and calm response during release windows.',
                'manager_review_improvements' => 'Increase design communication and document tradeoffs earlier.',
                'manager_rating' => 4.5,
                'manager_submitted_at' => '2026-06-24 15:00:00',
                'calibration_notes' => 'Ready for broader technical ownership in the next cycle.',
                'completed_at' => '2026-06-24 15:00:00',
                'meta' => [
                    'panel' => 'engineering-h1',
                ],
            ],
        );

        $activeReview = PerformanceReview::query()->updateOrCreate(
            [
                'cycle_id' => $activeCycle->id,
                'employee_id' => $nadia->id,
            ],
            [
                'manager_id' => $alya->id,
                'creator_id' => $hrManager?->id,
                'status' => 'draft',
                'meta' => [
                    'panel' => 'engineering-q3',
                ],
            ],
        );

        PerformanceReview::query()->updateOrCreate(
            [
                'cycle_id' => $activeCycle->id,
                'employee_id' => $rafi->id,
            ],
            [
                'manager_id' => null,
                'creator_id' => $hrManager?->id,
                'status' => 'draft',
                'meta' => [
                    'panel' => 'people-ops-q3',
                ],
            ],
        );

        PerformanceFeedback::query()->updateOrCreate(
            [
                'review_id' => $completedReview->id,
                'reviewer_id' => $rafi->id,
                'feedback_type' => 'stakeholder',
            ],
            [
                'reviewer_user_id' => $hrManager?->id,
                'relationship' => 'HR partner for onboarding and people workflow changes',
                'strengths' => 'Fast to unblock cross-functional questions and translates technical tradeoffs well.',
                'improvements' => 'Could share rollout risk earlier when implementation scope expands.',
                'comments' => 'Collaboration with HR stayed smooth during the attendance correction release.',
                'rating' => 4.3,
                'is_anonymous' => false,
                'submitted_at' => '2026-06-22 09:00:00',
                'meta' => [
                    'channel' => 'stakeholder',
                ],
            ],
        );

        PerformanceFeedback::query()->updateOrCreate(
            [
                'review_id' => $activeReview->id,
                'reviewer_user_id' => $departmentManager?->id,
                'feedback_type' => 'manager',
            ],
            [
                'reviewer_id' => $alya->id,
                'relationship' => 'Direct manager',
                'strengths' => 'Execution quality remains high during active sprint delivery.',
                'improvements' => 'Push architectural tradeoff notes to the team earlier in the week.',
                'comments' => 'Early coaching note captured before the formal manager review is submitted.',
                'rating' => 4.1,
                'is_anonymous' => false,
                'submitted_at' => '2026-07-18 16:30:00',
                'meta' => [
                    'channel' => 'manager-note',
                ],
            ],
        );
    }
}
