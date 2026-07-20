<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_cycles', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('name', 150);
            $table->string('review_type', 40)->default('quarterly');
            $table->date('period_start');
            $table->date('period_end');
            $table->string('status', 40)->default('draft');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('performance_goals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cycle_id')->constrained('performance_cycles')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('title', 160);
            $table->string('goal_type', 40)->default('goal');
            $table->string('category', 80)->nullable();
            $table->text('description')->nullable();
            $table->decimal('target_value', 15, 2)->nullable();
            $table->decimal('current_value', 15, 2)->nullable();
            $table->string('unit', 40)->nullable();
            $table->decimal('weight', 5, 2)->default(0);
            $table->decimal('progress_percent', 5, 2)->default(0);
            $table->string('status', 40)->default('draft');
            $table->date('due_date')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('performance_reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('cycle_id')->constrained('performance_cycles')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('creator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('overall_score', 5, 2)->nullable();
            $table->string('overall_rating', 60)->nullable();
            $table->string('status', 40)->default('draft');
            $table->text('employee_review_summary')->nullable();
            $table->text('employee_review_highlights')->nullable();
            $table->text('employee_review_challenges')->nullable();
            $table->decimal('employee_rating', 5, 2)->nullable();
            $table->timestamp('employee_submitted_at')->nullable();
            $table->text('manager_review_summary')->nullable();
            $table->text('manager_review_strengths')->nullable();
            $table->text('manager_review_improvements')->nullable();
            $table->decimal('manager_rating', 5, 2)->nullable();
            $table->timestamp('manager_submitted_at')->nullable();
            $table->text('calibration_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['cycle_id', 'employee_id']);
        });

        Schema::create('performance_feedback', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('review_id')->constrained('performance_reviews')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('reviewer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('feedback_type', 40)->default('peer');
            $table->string('relationship', 80)->nullable();
            $table->text('strengths')->nullable();
            $table->text('improvements')->nullable();
            $table->text('comments')->nullable();
            $table->decimal('rating', 5, 2)->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->timestamp('submitted_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_feedback');
        Schema::dropIfExists('performance_reviews');
        Schema::dropIfExists('performance_goals');
        Schema::dropIfExists('performance_cycles');
    }
};
