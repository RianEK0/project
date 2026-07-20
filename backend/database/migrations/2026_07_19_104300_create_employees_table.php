<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_number')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('work_email')->unique();
            $table->string('personal_email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('job_title');
            $table->string('employment_type');
            $table->string('employment_status')->default('active');
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->date('hire_date');
            $table->date('birth_date')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department_id', 'employment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
