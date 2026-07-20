<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->text('two_factor_secret')->nullable()->after('remember_token');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
            $table->unsignedSmallInteger('failed_login_attempts')->default(0)->after('two_factor_confirmed_at');
            $table->timestamp('last_failed_login_at')->nullable()->after('failed_login_attempts');
            $table->timestamp('locked_until')->nullable()->after('last_failed_login_at');
            $table->timestamp('password_changed_at')->nullable()->after('locked_until');
        });

        Schema::create('auth_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('device_name')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('remember')->default(false);
            $table->json('context')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('last_refreshed_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'revoked_at']);
            $table->index('expires_at');
        });

        Schema::create('auth_refresh_tokens', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('auth_session_id')->constrained('auth_sessions')->cascadeOnDelete();
            $table->string('token_hash')->unique();
            $table->ulid('replaced_by_token_id')->nullable()->index();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->timestamps();

            $table->index(['auth_session_id', 'revoked_at']);
            $table->index('expires_at');
        });

        Schema::create('login_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUlid('auth_session_id')->nullable()->constrained('auth_sessions')->nullOnDelete();
            $table->string('email');
            $table->boolean('successful')->default(false);
            $table->boolean('two_factor_passed')->default(false);
            $table->string('failure_reason')->nullable();
            $table->string('device_name')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('context')->nullable();
            $table->timestamp('attempted_at');
            $table->timestamps();

            $table->index(['user_id', 'attempted_at']);
            $table->index(['email', 'attempted_at']);
        });

        Schema::create('password_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('password');
            $table->timestamp('created_at');

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_histories');
        Schema::dropIfExists('login_histories');
        Schema::dropIfExists('auth_refresh_tokens');
        Schema::dropIfExists('auth_sessions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_secret',
                'two_factor_recovery_codes',
                'two_factor_confirmed_at',
                'failed_login_attempts',
                'last_failed_login_at',
                'locked_until',
                'password_changed_at',
            ]);
        });
    }
};
