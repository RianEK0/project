<?php

namespace Tests\Feature\Api;

use App\Http\Middleware\EnsurePermission;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\AccessControl\Infrastructure\Persistence\Models\Role;
use Modules\Leave\Infrastructure\Persistence\Models\LeaveType;
use Modules\Notifications\Infrastructure\Persistence\Models\NotificationChannelConfig;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollItem;
use Modules\Payroll\Infrastructure\Persistence\Models\PayrollRun;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceGoal;
use Modules\Performance\Infrastructure\Persistence\Models\PerformanceReview;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentApplication;
use Modules\Recruitment\Infrastructure\Persistence\Models\RecruitmentCandidate;
use Modules\Workforce\Infrastructure\Persistence\Models\Department;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;
use Tests\TestCase;

class WorkspaceReferenceAndConfigurationTest extends TestCase
{
    use RefreshDatabase;

    public function test_reference_endpoints_expose_department_organization_employee_leave_and_audit_data(): void
    {
        $this->seed(DatabaseSeeder::class);

        $headers = $this->authenticateEmail('rafi.saputra@enterprise-hris.local');
        $department = Department::query()->orderBy('name')->firstOrFail();
        $leaveType = LeaveType::query()
            ->where('deducts_balance', true)
            ->orderBy('name')
            ->firstOrFail();
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $this->getJson('/api/v1/departments?sort_by=name&sort_direction=asc&per_page=2', $headers)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.sort.by', 'name')
            ->assertJsonPath('meta.sort.direction', 'asc')
            ->assertJsonPath('data.0.code', $department->code);

        $this->getJson('/api/v1/organization/lookups', $headers)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'companies',
                    'branches',
                    'departments',
                    'divisions',
                    'sections',
                    'positions',
                    'employees',
                ],
            ])
            ->assertJsonFragment([
                'code' => 'ENT-HRIS',
            ]);

        $this->getJson('/api/v1/employees/lookups', $headers)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'departments',
                    'teams',
                    'branches',
                    'divisions',
                    'sections',
                    'positions',
                    'managers',
                    'employment_types',
                    'employment_statuses',
                ],
            ])
            ->assertJsonFragment([
                'value' => 'permanent',
            ]);

        $this->getJson('/api/v1/leave-types?deducts_balance=1&sort_by=name&sort_direction=asc&per_page=2', $headers)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.filters.deducts_balance', '1')
            ->assertJsonPath('data.0.code', $leaveType->code);

        $this->getJson("/api/v1/employees/{$employee->id}/audit-logs?per_page=1", $headers)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1);
    }

    public function test_attendance_workspace_endpoints_cover_overview_configuration_and_lists(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->withoutMiddleware(EnsurePermission::class);

        $managerHeaders = $this->authenticateEmail('rafi.saputra@enterprise-hris.local');
        $adminHeaders = $this->authenticateAsRole('hr-manager');
        $approverHeaders = $this->authenticateEmail('alya.pratama@enterprise-hris.local');
        $employee = Employee::query()->where('employee_number', 'EMP-0003')->firstOrFail();

        $this->getJson('/api/v1/attendance/overview', $managerHeaders)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'today' => ['date', 'employee', 'shift', 'record', 'holiday'],
                    'stats',
                ],
            ]);

        $this->getJson('/api/v1/attendance/lookups', $managerHeaders)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'employees',
                    'shifts',
                    'holidays',
                    'today',
                ],
            ])
            ->assertJsonPath('data.shifts.0.code', 'FLEX-BDG');

        $this->getJson('/api/v1/attendance/corrections?per_page=1&sort_by=created_at&sort_direction=asc', $managerHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.sort.by', 'created_at');

        $this->getJson('/api/v1/attendance/approvals?per_page=1', $approverHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1);

        $this->getJson('/api/v1/attendance/shifts?is_active=1&per_page=2', $managerHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.filters.is_active', '1');

        $shiftResponse = $this->postJson('/api/v1/attendance/shifts', [
            'code' => 'SHIFT-EVE',
            'name' => 'Evening Shift',
            'start_time' => '14:00',
            'end_time' => '22:00',
            'grace_minutes' => 20,
            'requires_gps' => true,
            'requires_photo' => true,
            'requires_qr' => true,
            'latitude' => -6.2240937,
            'longitude' => 106.8091178,
            'radius_meters' => 150,
            'qr_token' => 'SHIFT-EVE-QR',
            'is_active' => true,
            'meta' => ['branch' => 'Jakarta HQ'],
        ], $adminHeaders);

        $shiftResponse
            ->assertCreated()
            ->assertJsonPath('data.code', 'SHIFT-EVE')
            ->assertJsonPath('data.requires_gps', true)
            ->assertJsonPath('data.qr_token', 'SHIFT-EVE-QR');

        $this->postJson('/api/v1/attendance/shift-assignments', [
            'employee_id' => $employee->id,
            'shift_id' => $shiftResponse->json('data.id'),
            'start_date' => '2026-07-20',
            'end_date' => '2026-08-31',
        ], $adminHeaders)
            ->assertCreated()
            ->assertJsonPath('data.employee.employee_number', $employee->employee_number)
            ->assertJsonPath('data.shift.code', 'SHIFT-EVE');

        $this->getJson('/api/v1/attendance/holidays?type=public&per_page=2', $managerHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.filters.type', 'public');

        $this->postJson('/api/v1/attendance/holidays', [
            'name' => 'Founders Day',
            'holiday_date' => '2026-08-18',
            'type' => 'company',
            'notes' => 'Company anniversary celebration day.',
        ], $adminHeaders)
            ->assertCreated()
            ->assertJsonPath('data.name', 'Founders Day')
            ->assertJsonPath('data.type', 'company');
    }

    public function test_recruitment_workspace_endpoints_cover_lookup_list_show_and_update_flows(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);

        $headers = $this->authenticateEmail('bagas.recruitment@enterprise-hris.local');
        $candidate = RecruitmentCandidate::query()
            ->with('applications.vacancy')
            ->orderBy('id')
            ->firstOrFail();
        $application = RecruitmentApplication::query()
            ->with('candidate', 'vacancy')
            ->where('stage', 'interview')
            ->firstOrFail();

        $this->getJson('/api/v1/recruitment/lookups', $headers)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'departments',
                    'branches',
                    'positions',
                    'hiring_managers',
                    'recruiters',
                    'stages',
                    'application_statuses',
                    'vacancy_statuses',
                    'employment_types',
                    'workplace_types',
                ],
            ])
            ->assertJsonFragment([
                'value' => 'offer',
            ]);

        $this->getJson('/api/v1/recruitment/candidates?source='.urlencode((string) $candidate->source).'&per_page=1', $headers)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.filters.source', (string) $candidate->source);

        $this->getJson('/api/v1/recruitment/applications?stage=interview&per_page=1', $headers)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.filters.stage', 'interview');

        $this->getJson("/api/v1/recruitment/applications/{$application->id}", $headers)
            ->assertOk()
            ->assertJsonPath('data.id', $application->id)
            ->assertJsonPath('data.candidate.id', $application->candidate_id);

        $updatedCandidateName = $candidate->full_name.' Updated';

        $candidateUpdateResponse = $this->post(
            "/api/v1/recruitment/candidates/{$candidate->id}/update",
            [
                'full_name' => $updatedCandidateName,
                'location' => 'Jakarta',
                'status' => 'on_hold',
                'last_contacted_at' => '2026-07-19 09:15:00',
                'vacancy_id' => $candidate->applications->first()?->vacancy_id,
                'application_notes' => 'Candidate requested a short scheduling pause.',
                'cv' => UploadedFile::fake()->create('updated-candidate-cv.pdf', 200, 'application/pdf'),
            ],
            [
                'Accept' => 'application/json',
                ...$headers,
            ],
        );

        $candidateUpdateResponse
            ->assertOk()
            ->assertJsonPath('data.full_name', $updatedCandidateName)
            ->assertJsonPath('data.location', 'Jakarta')
            ->assertJsonPath('data.status', 'on_hold')
            ->assertJsonPath('data.cv_file_name', 'updated-candidate-cv.pdf');

        $applicationUpdateResponse = $this->post(
            "/api/v1/recruitment/applications/{$application->id}/update",
            [
                'stage' => 'offer',
                'status' => 'active',
                'rating' => 4.5,
                'offer_sent_at' => '2026-07-19 11:30:00',
                'notes' => 'Offer package shared after final panel sign-off.',
                'offer_letter' => UploadedFile::fake()->create('offer-letter.pdf', 120, 'application/pdf'),
            ],
            [
                'Accept' => 'application/json',
                ...$headers,
            ],
        );

        $applicationUpdateResponse
            ->assertOk()
            ->assertJsonPath('data.stage', 'offer')
            ->assertJsonPath('data.rating', 4.5)
            ->assertJsonPath('data.offer_letter_file_name', 'offer-letter.pdf');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.candidate.updated',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'recruitment.application.updated',
        ]);
    }

    public function test_payroll_performance_and_notification_workspaces_cover_read_and_update_endpoints(): void
    {
        $this->seed(DatabaseSeeder::class);

        $payrollHeaders = $this->authenticateEmail('mira.payroll@enterprise-hris.local');
        $hrHeaders = $this->authenticateEmail('rafi.saputra@enterprise-hris.local');
        $review = PerformanceReview::query()->orderBy('id')->firstOrFail();
        $goal = PerformanceGoal::query()->orderBy('id')->firstOrFail();
        $channelConfig = NotificationChannelConfig::query()->where('channel', 'slack')->firstOrFail();

        $this->getJson('/api/v1/payroll/overview', $payrollHeaders)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'current_date',
                    'latest_run',
                    'latest_payslip',
                    'stats',
                ],
            ]);

        $this->getJson('/api/v1/payroll/lookups', $payrollHeaders)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'employees',
                    'defaults',
                ],
            ])
            ->assertJsonPath('data.defaults.payroll_month', '2026-07');

        $employeeIds = Employee::query()
            ->whereIn('employee_number', ['EMP-0001', 'EMP-0002'])
            ->pluck('id')
            ->all();

        $runResponse = $this->postJson('/api/v1/payroll/runs', [
            'payroll_month' => '2026-07',
            'title' => 'Special Adjustment Payroll July 2026',
            'period_start' => '2026-07-01',
            'period_end' => '2026-07-31',
            'tax_rate' => 0.05,
            'bpjs_health_rate' => 0.01,
            'bpjs_employment_rate' => 0.02,
            'overtime_multiplier' => 1,
            'employee_ids' => $employeeIds,
        ], $payrollHeaders);

        $runResponse->assertCreated();

        $run = PayrollRun::query()->findOrFail($runResponse->json('data.id'));
        $payrollItem = PayrollItem::query()
            ->where('payroll_run_id', $run->id)
            ->orderBy('id')
            ->firstOrFail();

        $this->getJson('/api/v1/payroll/approvals?stage=hr&per_page=1', $hrHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.filters.stage', 'hr');

        $this->putJson("/api/v1/payroll/items/{$payrollItem->id}", [
            'allowance_amount' => 1500000,
            'deduction_amount' => 150000,
            'tax_amount' => 200000,
            'bpjs_amount' => 100000,
            'bonus_amount' => 500000,
            'thr_amount' => 250000,
            'notes' => 'Leadership-approved special payroll adjustment.',
            'allowance_breakdown' => ['transport' => 750000, 'meal' => 750000],
            'deduction_breakdown' => ['loan' => 150000],
        ], $payrollHeaders)
            ->assertOk()
            ->assertJsonPath('data.allowance_amount', 1500000)
            ->assertJsonPath('data.bonus_amount', 500000)
            ->assertJsonPath('data.notes', 'Leadership-approved special payroll adjustment.');

        $this->getJson('/api/v1/performance/lookups', $hrHeaders)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'employees',
                    'cycles',
                    'goal_types',
                    'goal_statuses',
                    'review_statuses',
                    'review_types',
                    'feedback_types',
                    'defaults',
                ],
            ])
            ->assertJsonFragment([
                'value' => 'stakeholder',
            ]);

        $this->getJson("/api/v1/performance/goals?employee_id={$goal->employee_id}&per_page=1", $hrHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.filters.employee_id', (string) $goal->employee_id);

        $this->getJson("/api/v1/performance/reviews?status={$review->status}&per_page=1", $hrHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.filters.status', $review->status);

        $this->getJson("/api/v1/performance/reviews/{$review->id}", $hrHeaders)
            ->assertOk()
            ->assertJsonPath('data.id', $review->id);

        $this->getJson('/api/v1/notifications/overview', $hrHeaders)
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'current_date',
                    'stats',
                    'channel_health',
                    'recent_inbox',
                    'recent_deliveries',
                ],
            ]);

        $this->getJson('/api/v1/notifications/lookups', $hrHeaders)
            ->assertOk()
            ->assertJsonPath('data.can_manage', true)
            ->assertJsonFragment([
                'channel' => 'slack',
            ]);

        $this->getJson('/api/v1/notifications/deliveries?channel=in_app&per_page=1', $hrHeaders)
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.filters.channel', 'in_app');

        $this->putJson("/api/v1/notifications/channels/{$channelConfig->id}", [
            'label' => 'Slack Workspace Ready',
            'driver' => 'slack',
            'transport_mode' => 'ready',
            'is_enabled' => true,
            'description' => 'Prepared for workspace connector rollout.',
            'config' => ['workspace' => 'enterprise-hris'],
            'last_tested_at' => '2026-07-19 13:15:00',
        ], $hrHeaders)
            ->assertOk()
            ->assertJsonPath('data.channel', 'slack')
            ->assertJsonPath('data.label', 'Slack Workspace Ready')
            ->assertJsonPath('data.status', 'ready')
            ->assertJsonPath('data.updated_by.email', 'rafi.saputra@enterprise-hris.local');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'payroll.item.updated',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'notification.channel.updated',
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function authenticateAsRole(string $roleName): array
    {
        $user = User::factory()->create([
            'name' => str($roleName)->headline()->toString(),
            'email' => "{$roleName}.coverage@example.com",
            'password' => 'Password123!',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $role = Role::query()->where('name', $roleName)->firstOrFail();
        $user->roles()->sync([$role->id]);

        return $this->authenticateUser($user);
    }
}
