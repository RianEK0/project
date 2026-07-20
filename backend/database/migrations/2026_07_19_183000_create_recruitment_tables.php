<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recruitment_vacancies', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('title');
            $table->string('employment_type', 40);
            $table->string('workplace_type', 40)->default('onsite');
            $table->string('status', 40)->default('draft');
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('position_id')->nullable()->constrained('positions')->nullOnDelete();
            $table->foreignId('recruiter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('hiring_manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->unsignedInteger('openings_count')->default(1);
            $table->decimal('min_experience_years', 5, 2)->default(0);
            $table->decimal('salary_min', 15, 2)->nullable();
            $table->decimal('salary_max', 15, 2)->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->date('publish_date')->nullable();
            $table->date('close_date')->nullable();
            $table->longText('description')->nullable();
            $table->longText('requirements')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('recruitment_candidates', function (Blueprint $table): void {
            $table->id();
            $table->string('candidate_code')->unique();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone', 50)->nullable();
            $table->string('source', 100)->nullable();
            $table->string('location')->nullable();
            $table->string('current_company')->nullable();
            $table->string('current_position')->nullable();
            $table->decimal('experience_years', 5, 2)->default(0);
            $table->decimal('expected_salary', 15, 2)->nullable();
            $table->string('currency', 10)->default('IDR');
            $table->text('summary')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->string('status', 40)->default('active');
            $table->string('cv_disk', 40)->nullable();
            $table->string('cv_path')->nullable();
            $table->string('cv_file_name')->nullable();
            $table->string('cv_mime_type')->nullable();
            $table->unsignedBigInteger('cv_file_size')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('hired_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('recruitment_applications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vacancy_id')->constrained('recruitment_vacancies')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('recruitment_candidates')->cascadeOnDelete();
            $table->foreignId('recruiter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('hired_employee_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->dateTime('applied_at');
            $table->string('stage', 40)->default('applied');
            $table->string('status', 40)->default('active');
            $table->decimal('rating', 4, 2)->nullable();
            $table->dateTime('offer_sent_at')->nullable();
            $table->dateTime('offer_accepted_at')->nullable();
            $table->string('offer_letter_disk', 40)->nullable();
            $table->string('offer_letter_path')->nullable();
            $table->string('offer_letter_file_name')->nullable();
            $table->string('offer_letter_mime_type')->nullable();
            $table->unsignedBigInteger('offer_letter_file_size')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['vacancy_id', 'candidate_id']);
        });

        Schema::create('recruitment_interviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('application_id')->constrained('recruitment_applications')->cascadeOnDelete();
            $table->string('title');
            $table->string('interview_type', 40);
            $table->string('stage', 40)->default('interview');
            $table->dateTime('scheduled_at');
            $table->unsignedInteger('duration_minutes')->default(60);
            $table->string('location')->nullable();
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 40)->default('scheduled');
            $table->decimal('score', 4, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::create('recruitment_assessments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('application_id')->constrained('recruitment_applications')->cascadeOnDelete();
            $table->string('title');
            $table->string('assessment_type', 40);
            $table->dateTime('assigned_at')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->string('status', 40)->default('assigned');
            $table->decimal('score', 8, 2)->nullable();
            $table->decimal('max_score', 8, 2)->nullable();
            $table->string('result')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('reviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recruitment_assessments');
        Schema::dropIfExists('recruitment_interviews');
        Schema::dropIfExists('recruitment_applications');
        Schema::dropIfExists('recruitment_candidates');
        Schema::dropIfExists('recruitment_vacancies');
    }
};
