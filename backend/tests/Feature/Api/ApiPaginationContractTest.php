<?php

namespace Tests\Feature\Api;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiPaginationContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_paginated_endpoints_return_the_standard_json_contract(): void
    {
        $this->seed(DatabaseSeeder::class);

        $headers = $this->authenticateEmail('admin@enterprise-hris.local');

        $endpoints = [
            '/api/v1/employees?per_page=1&search=EMP&sort_by=full_name&sort_direction=asc',
            '/api/v1/teams?per_page=1&search=team&sort_by=name&sort_direction=asc',
            '/api/v1/leave-requests?per_page=1&sort_by=start_date&sort_direction=asc',
            '/api/v1/attendance?per_page=1&sort_by=attendance_date&sort_direction=desc',
            '/api/v1/payroll/runs?per_page=1&sort_by=payroll_month&sort_direction=desc',
            '/api/v1/recruitment/vacancies?per_page=1&sort_by=title&sort_direction=asc',
            '/api/v1/performance/cycles?per_page=1&sort_by=name&sort_direction=asc',
            '/api/v1/notifications/inbox?per_page=1&sort_by=created_at&sort_direction=desc',
            '/api/v1/audit-logs?per_page=1&sort_by=created_at&sort_direction=desc',
            '/api/v1/auth/sessions?per_page=1&sort_by=created_at&sort_direction=desc',
            '/api/v1/auth/login-history?per_page=1&sort_by=attempted_at&sort_direction=desc',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint, $headers);

            $response
                ->assertOk()
                ->assertJsonStructure([
                    'message',
                    'data',
                    'meta' => [
                        'current_page',
                        'last_page',
                        'per_page',
                        'total',
                        'from',
                        'to',
                        'search',
                        'sort' => [
                            'by',
                            'direction',
                        ],
                        'filters',
                    ],
                ]);
        }
    }

    public function test_attendance_report_exposes_summary_with_paginated_record_metadata(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->getJson(
            '/api/v1/attendance/report?per_page=1&start_date=2026-07-16&end_date=2026-07-20&sort_by=attendance_date&sort_direction=asc',
            $this->authenticateEmail('rafi.saputra@enterprise-hris.local'),
        );

        $response
            ->assertOk()
            ->assertJsonStructure([
                'message',
                'data' => [
                    'summary' => [
                        'total_records',
                        'present_records',
                        'late_records',
                        'overtime_minutes',
                        'worked_minutes',
                        'weekend_records',
                        'holiday_records',
                        'pending_corrections',
                    ],
                    'records',
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'from',
                    'to',
                    'search',
                    'sort' => [
                        'by',
                        'direction',
                    ],
                    'filters',
                ],
            ])
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonPath('meta.sort.by', 'attendance_date')
            ->assertJsonPath('meta.sort.direction', 'asc');
    }
}
