<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_shifts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('grace_minutes')->default(0);
            $table->boolean('requires_gps')->default(false);
            $table->boolean('requires_photo')->default(false);
            $table->boolean('requires_qr')->default(false);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('radius_meters')->nullable();
            $table->string('qr_token')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('attendance_shift_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attendance_shift_id')->constrained('attendance_shifts')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'start_date']);
            $table->index(['employee_id', 'attendance_shift_id']);
        });

        Schema::create('attendance_holidays', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('holiday_date')->unique();
            $table->string('type')->default('public');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attendance_shift_id')->nullable()->constrained('attendance_shifts')->nullOnDelete();
            $table->foreignId('attendance_holiday_id')->nullable()->constrained('attendance_holidays')->nullOnDelete();
            $table->date('attendance_date');
            $table->string('status')->default('incomplete');
            $table->timestamp('clock_in_at')->nullable();
            $table->timestamp('clock_out_at')->nullable();
            $table->decimal('clock_in_latitude', 10, 7)->nullable();
            $table->decimal('clock_in_longitude', 10, 7)->nullable();
            $table->decimal('clock_out_latitude', 10, 7)->nullable();
            $table->decimal('clock_out_longitude', 10, 7)->nullable();
            $table->string('clock_in_source')->nullable();
            $table->string('clock_out_source')->nullable();
            $table->string('clock_in_photo_path')->nullable();
            $table->string('clock_out_photo_path')->nullable();
            $table->boolean('is_late')->default(false);
            $table->unsignedInteger('late_minutes')->default(0);
            $table->boolean('is_overtime')->default(false);
            $table->unsignedInteger('overtime_minutes')->default(0);
            $table->unsignedInteger('worked_minutes')->default(0);
            $table->boolean('is_weekend')->default(false);
            $table->boolean('is_holiday')->default(false);
            $table->boolean('is_corrected')->default(false);
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'attendance_date']);
            $table->index(['attendance_date', 'status']);
            $table->index(['employee_id', 'status']);
        });

        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_record_id')->constrained('attendance_records')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('pending');
            $table->date('requested_attendance_date');
            $table->timestamp('requested_clock_in_at')->nullable();
            $table->timestamp('requested_clock_out_at')->nullable();
            $table->text('reason');
            $table->text('remarks')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->json('snapshot_before')->nullable();
            $table->json('snapshot_after')->nullable();
            $table->timestamps();

            $table->index(['approver_id', 'status']);
            $table->index(['employee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('attendance_holidays');
        Schema::dropIfExists('attendance_shift_assignments');
        Schema::dropIfExists('attendance_shifts');
    }
};
