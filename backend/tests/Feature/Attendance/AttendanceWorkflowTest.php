<?php

namespace Tests\Feature\Attendance;

use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceCorrection;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceRecord;
use Tests\TestCase;

class AttendanceWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_clock_in_and_clock_out_with_validation(): void
    {
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);

        Carbon::setTestNow('2026-07-20 08:37:00');

        $clockInResponse = $this->post('/api/v1/attendance/clock-in', [
            'latitude' => -6.2240937,
            'longitude' => 106.8091178,
            'qr_token' => 'OFFICE-JKT-QR',
            'photo' => UploadedFile::fake()->image('clock-in.jpg'),
        ], [
            'Accept' => 'application/json',
            ...$this->authenticateEmail('alya.pratama@enterprise-hris.local'),
        ]);

        $clockInResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'incomplete')
            ->assertJsonPath('data.clock_in_source', 'qr');

        Carbon::setTestNow('2026-07-20 18:31:00');

        $clockOutResponse = $this->post('/api/v1/attendance/clock-out', [
            'latitude' => -6.2240937,
            'longitude' => 106.8091178,
            'qr_token' => 'OFFICE-JKT-QR',
            'photo' => UploadedFile::fake()->image('clock-out.jpg'),
        ], [
            'Accept' => 'application/json',
            ...$this->authenticateEmail('alya.pratama@enterprise-hris.local'),
        ]);

        $clockOutResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'present')
            ->assertJsonPath('data.is_overtime', true);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'attendance.clocked-in',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'attendance.clocked-out',
        ]);

        Carbon::setTestNow();
    }

    public function test_employee_can_submit_correction_and_manager_can_approve_it(): void
    {
        $this->seed(DatabaseSeeder::class);

        $record = AttendanceRecord::query()
            ->whereDate('attendance_date', '2026-07-17')
            ->whereHas('employee.user', static fn ($query) => $query->where('email', 'nadia.putri@enterprise-hris.local'))
            ->firstOrFail();

        $requestResponse = $this->postJson('/api/v1/attendance/corrections', [
            'attendance_record_id' => $record->id,
            'attendance_date' => '2026-07-17',
            'requested_clock_in_at' => '2026-07-17 08:35:00',
            'requested_clock_out_at' => '2026-07-17 18:40:00',
            'reason' => 'Clock in happened before the mobile signal stabilized in the lobby.',
        ], $this->authenticateEmail('nadia.putri@enterprise-hris.local'));

        $requestResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.approver.email', 'alya.pratama@enterprise-hris.local');

        $correction = AttendanceCorrection::query()->firstOrFail();

        $approvalResponse = $this->postJson("/api/v1/attendance/corrections/{$correction->id}/approve", [
            'remarks' => 'Approved after matching building lobby logs.',
        ], $this->authenticateEmail('alya.pratama@enterprise-hris.local'));

        $approvalResponse
            ->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.attendance_record.status', 'corrected');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'attendance.correction.approved',
        ]);
    }

    public function test_hr_can_create_manual_attendance_and_report_reflects_it(): void
    {
        $this->seed(DatabaseSeeder::class);

        $employeeId = AttendanceRecord::query()
            ->whereHas('employee.user', static fn ($query) => $query->where('email', 'nadia.putri@enterprise-hris.local'))
            ->firstOrFail()
            ->employee_id;

        $manualResponse = $this->post('/api/v1/attendance/manual', [
            'employee_id' => $employeeId,
            'attendance_date' => '2026-07-16',
            'clock_in_at' => '2026-07-16 08:30:00',
            'clock_out_at' => '2026-07-16 17:45:00',
            'notes' => 'Backfilled from branch admin register.',
        ], [
            'Accept' => 'application/json',
            ...$this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        ]);

        $manualResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'manual')
            ->assertJsonPath('data.clock_in_source', 'manual');

        $reportResponse = $this->getJson('/api/v1/attendance/report?start_date=2026-07-16&end_date=2026-07-17', $this->authenticateEmail('rafi.saputra@enterprise-hris.local'));

        $reportResponse
            ->assertOk()
            ->assertJsonPath('data.summary.total_records', 3)
            ->assertJsonPath('data.summary.pending_corrections', 0);
    }

    public function test_attendance_list_supports_pagination_filters_sorting_and_search(): void
    {
        $this->seed(DatabaseSeeder::class);

        $record = AttendanceRecord::query()
            ->whereHas('employee.user', static fn ($query) => $query->where('email', 'nadia.putri@enterprise-hris.local'))
            ->orderBy('attendance_date')
            ->firstOrFail();

        $response = $this->getJson(
            "/api/v1/attendance?employee_id={$record->employee_id}&search=Nadia&sort_by=attendance_date&sort_direction=asc&per_page=1",
            $this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        );

        $response
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.search', 'Nadia')
            ->assertJsonPath('meta.sort.by', 'attendance_date')
            ->assertJsonPath('meta.sort.direction', 'asc')
            ->assertJsonPath('meta.filters.employee_id', (string) $record->employee_id)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.employee.id', $record->employee_id);
    }
}
