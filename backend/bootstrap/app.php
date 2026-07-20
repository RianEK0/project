<?php

use App\Http\Middleware\EnsureActiveAuthSession;
use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\SanitizeRequestInput;
use App\Http\Middleware\SecureHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append([
            SanitizeRequestInput::class,
            SecureHeaders::class,
        ]);

        $middleware->alias([
            'active-session' => EnsureActiveAuthSession::class,
            'permission' => EnsurePermission::class,
            'role' => EnsureRole::class,
        ]);

        $middleware->validateCsrfTokens();
        $middleware->trustProxies(at: env('SECURITY_TRUSTED_PROXIES', '*'));
        $middleware->throttleApi('api');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
