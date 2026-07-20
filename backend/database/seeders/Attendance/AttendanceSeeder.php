<?php

namespace Database\Seeders\Attendance;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceHoliday;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceRecord;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceShift;
use Modules\Attendance\Infrastructure\Persistence\Models\AttendanceShiftAssignment;
use Modules\Workforce\Infrastructure\Persistence\Models\Employee;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        $officeShift = AttendanceShift::query()->updateOrCreate(
            ['code' => 'OFFICE-JKT'],
            [
                'name' => 'Jakarta Office Shift',
                'start_time' => '09:00',
                'end_time' => '18:00',
                'grace_minutes' => 5,
                'requires_gps' => true,
                'requires_photo' => true,
                'requires_qr' => true,
                'latitude' => -6.2240937,
                'longitude' => 106.8091178,
                'radius_meters' => 350,
                'qr_token' => 'OFFICE-JKT-QR',
                'is_active' => true,
                'meta' => [
                    'label' => 'HQ Geofenced Shift',
                ],
            ],
        );

        $flexShift = AttendanceShift::query()->updateOrCreate(
            ['code' => 'FLEX-BDG'],
            [
                'name' => 'Bandung Flexible Shift',
                'start_time' => '08:30',
                'end_time' => '17:30',
                'grace_minutes' => 10,
                'requires_gps' => false,
                'requires_photo' => false,
                'requires_qr' => false,
                'is_active' => true,
            ],
        );

        AttendanceHoliday::query()->updateOrCreate(
            ['holiday_date' => '2026-08-17'],
            [
                'name' => 'Independence Day',
                'type' => 'public',
                'notes' => 'National holiday in Indonesia.',
            ],
        );

        AttendanceHoliday::query()->updateOrCreate(
            ['holiday_date' => '2026-12-25'],
            [
                'name' => 'Christmas Day',
                'type' => 'public',
                'notes' => 'Company-wide holiday.',
            ],
        );

        $alya = Employee::query()->where('employee_number', 'EMP-0001')->first();
        $rafi = Employee::query()->where('employee_number', 'EMP-0002')->first();
        $nadia = Employee::query()->where('employee_number', 'EMP-0003')->first();
        $hrUser = User::query()->where('email', 'rafi.saputra@enterprise-hris.local')->first();

        foreach ([$alya, $rafi] as $employee) {
            if (! $employee) {
                continue;
            }

            AttendanceShiftAssignment::query()->updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'start_date' => '2026-07-01',
                ],
                [
                    'attendance_shift_id' => $officeShift->id,
                    'end_date' => null,
                ],
            );
        }

        if ($nadia) {
            AttendanceShiftAssignment::query()->updateOrCreate(
                [
                    'employee_id' => $nadia->id,
                    'start_date' => '2026-07-01',
                ],
                [
                    'attendance_shift_id' => $flexShift->id,
                    'end_date' => null,
                ],
            );

            AttendanceRecord::query()->updateOrCreate(
                [
                    'employee_id' => $nadia->id,
                    'attendance_date' => '2026-07-17',
                ],
                [
                    'attendance_shift_id' => $flexShift->id,
                    'status' => 'late',
                    'clock_in_at' => Carbon::parse('2026-07-17 08:47:00'),
                    'clock_out_at' => Carbon::parse('2026-07-17 18:35:00'),
                    'clock_in_source' => 'self-service',
                    'clock_out_source' => 'self-service',
                    'is_late' => true,
                    'late_minutes' => 7,
                    'is_overtime' => true,
                    'overtime_minutes' => 65,
                    'worked_minutes' => 588,
                    'is_weekend' => false,
                    'is_holiday' => false,
                    'is_corrected' => false,
                    'created_by' => $nadia->user_id,
                    'updated_by' => $nadia->user_id,
                ],
            );
        }

        if ($alya) {
            AttendanceRecord::query()->updateOrCreate(
                [
                    'employee_id' => $alya->id,
                    'attendance_date' => '2026-07-17',
                ],
                [
                    'attendance_shift_id' => $officeShift->id,
                    'status' => 'present',
                    'clock_in_at' => Carbon::parse('2026-07-17 08:58:00'),
                    'clock_out_at' => Carbon::parse('2026-07-17 18:22:00'),
                    'clock_in_source' => 'qr',
                    'clock_out_source' => 'qr',
                    'is_late' => false,
                    'late_minutes' => 0,
                    'is_overtime' => true,
                    'overtime_minutes' => 22,
                    'worked_minutes' => 564,
                    'is_weekend' => false,
                    'is_holiday' => false,
                    'is_corrected' => false,
                    'created_by' => $alya->user_id,
                    'updated_by' => $alya->user_id,
                ],
            );
        }

        if ($rafi && $hrUser) {
            AttendanceRecord::query()->updateOrCreate(
                [
                    'employee_id' => $rafi->id,
                    'attendance_date' => '2026-07-18',
                ],
                [
                    'attendance_shift_id' => $officeShift->id,
                    'status' => 'manual',
                    'clock_in_at' => Carbon::parse('2026-07-18 09:15:00'),
                    'clock_out_at' => Carbon::parse('2026-07-18 13:00:00'),
                    'clock_in_source' => 'manual',
                    'clock_out_source' => 'manual',
                    'is_late' => true,
                    'late_minutes' => 10,
                    'is_overtime' => false,
                    'overtime_minutes' => 0,
                    'worked_minutes' => 225,
                    'is_weekend' => true,
                    'is_holiday' => false,
                    'is_corrected' => false,
                    'notes' => 'Weekend HR onboarding support.',
                    'created_by' => $hrUser->id,
                    'updated_by' => $hrUser->id,
                ],
            );
        }
    }
}
