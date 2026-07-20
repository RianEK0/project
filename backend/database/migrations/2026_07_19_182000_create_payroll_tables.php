<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_runs', function (Blueprint $table) {
            $table->id();
            $table->string('payroll_month', 7)->unique();
            $table->string('title');
            $table->date('period_start');
            $table->date('period_end');
            $table->string('status')->default('draft');
            $table->decimal('overtime_rate_per_hour', 14, 2)->nullable();
            $table->decimal('overtime_multiplier', 5, 2)->default(1.00);
            $table->decimal('tax_rate', 5, 4)->default(0.0500);
            $table->decimal('bpjs_health_rate', 5, 4)->default(0.0100);
            $table->decimal('bpjs_employment_rate', 5, 4)->default(0.0200);
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['status', 'payroll_month']);
        });

        Schema::create('payroll_run_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('approver_id')->constrained('users')->cascadeOnDelete();
            $table->string('stage');
            $table->string('status')->default('queued');
            $table->timestamp('acted_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'approver_id', 'stage']);
            $table->index(['approver_id', 'status']);
        });

        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('currency', 10)->default('IDR');
            $table->decimal('basic_salary', 14, 2)->default(0);
            $table->decimal('allowance_amount', 14, 2)->default(0);
            $table->decimal('deduction_amount', 14, 2)->default(0);
            $table->decimal('tax_amount', 14, 2)->default(0);
            $table->decimal('bpjs_amount', 14, 2)->default(0);
            $table->unsignedInteger('overtime_minutes')->default(0);
            $table->decimal('overtime_amount', 14, 2)->default(0);
            $table->decimal('bonus_amount', 14, 2)->default(0);
            $table->decimal('thr_amount', 14, 2)->default(0);
            $table->decimal('gross_amount', 14, 2)->default(0);
            $table->decimal('net_amount', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
            $table->index(['employee_id', 'net_amount']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_items');
        Schema::dropIfExists('payroll_run_approvals');
        Schema::dropIfExists('payroll_runs');
    }
};
