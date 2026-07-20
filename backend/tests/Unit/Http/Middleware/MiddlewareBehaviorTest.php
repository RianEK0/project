<?php

namespace Tests\Unit\Http\Middleware;

use App\Http\Middleware\EnsurePermission;
use App\Http\Middleware\EnsureRole;
use App\Http\Middleware\SanitizeRequestInput;
use App\Http\Middleware\SecureHeaders;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class MiddlewareBehaviorTest extends TestCase
{
    public function test_ensure_permission_returns_unauthorized_when_user_is_missing(): void
    {
        $request = Request::create('/api/v1/employees', 'GET');
        $request->setUserResolver(static fn (?string $guard = null) => null);

        $response = (new EnsurePermission())->handle(
            $request,
            static fn (): Response => new Response('ok'),
            'employees.view',
        );

        $this->assertSame(401, $response->getStatusCode());
        $this->assertSame('Unauthenticated.', json_decode($response->getContent(), true)['message']);
    }

    public function test_ensure_permission_normalizes_delimited_permissions_before_authorization(): void
    {
        $user = new class
        {
            /** @var list<string> */
            public array $receivedPermissions = [];

            public function hasAnyPermission(array $permissions): bool
            {
                $this->receivedPermissions = $permissions;

                return $permissions === ['employees.view', 'employees.create', 'employees.update'];
            }
        };

        $request = Request::create('/api/v1/employees', 'GET');
        $request->setUserResolver(static fn (?string $guard = null) => $user);

        $response = (new EnsurePermission())->handle(
            $request,
            static fn (): Response => new Response('allowed'),
            'employees.view, employees.create',
            'employees.update|employees.view',
        );

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('allowed', $response->getContent());
        $this->assertSame(['employees.view', 'employees.create', 'employees.update'], $user->receivedPermissions);
    }

    public function test_ensure_permission_returns_forbidden_when_permission_is_missing(): void
    {
        $user = new class
        {
            public function hasAnyPermission(array $permissions): bool
            {
                return false;
            }
        };

        $request = Request::create('/api/v1/payroll/runs', 'GET');
        $request->setUserResolver(static fn (?string $guard = null) => $user);

        $response = (new EnsurePermission())->handle(
            $request,
            static fn (): Response => new Response('blocked'),
            'payroll.manage',
        );

        $this->assertSame(403, $response->getStatusCode());
        $this->assertSame(
            'You do not have permission to perform this action.',
            json_decode($response->getContent(), true)['message'],
        );
    }

    public function test_ensure_role_allows_empty_role_list_and_denies_missing_role(): void
    {
        $allowedUser = new class
        {
            /** @var list<string> */
            public array $receivedRoles = [];

            public function hasAnyRole(array $roles): bool
            {
                $this->receivedRoles = $roles;

                return in_array('super-admin', $roles, true);
            }
        };

        $allowedRequest = Request::create('/api/v1/access-control', 'GET');
        $allowedRequest->setUserResolver(static fn (?string $guard = null) => $allowedUser);

        $allowedResponse = (new EnsureRole())->handle(
            $allowedRequest,
            static fn (): Response => new Response('ok'),
            'super-admin|hr-manager',
        );

        $this->assertSame(200, $allowedResponse->getStatusCode());
        $this->assertSame(['super-admin', 'hr-manager'], $allowedUser->receivedRoles);

        $deniedUser = new class
        {
            public function hasAnyRole(array $roles): bool
            {
                return false;
            }
        };

        $deniedRequest = Request::create('/api/v1/access-control', 'GET');
        $deniedRequest->setUserResolver(static fn (?string $guard = null) => $deniedUser);

        $deniedResponse = (new EnsureRole())->handle(
            $deniedRequest,
            static fn (): Response => new Response('ok'),
            'super-admin',
        );

        $this->assertSame(403, $deniedResponse->getStatusCode());
        $this->assertSame(
            'You do not have the required role to perform this action.',
            json_decode($deniedResponse->getContent(), true)['message'],
        );
    }

    public function test_sanitize_request_input_removes_control_characters_from_json_and_form_payloads(): void
    {
        $jsonRequest = Request::create(
            '/api/v1/auth/login?search=na%00dia',
            'POST',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode([
                'name' => "Na\x07dia",
                'nested' => [
                    'notes' => "HR\x1FIS",
                ],
            ], JSON_THROW_ON_ERROR),
        );

        (new SanitizeRequestInput())->handle($jsonRequest, function (Request $request): Response {
            $this->assertSame('nadia', $request->query('search'));
            $this->assertSame('Nadia', $request->json('name'));
            $this->assertSame('HRIS', $request->json('nested.notes'));

            return new Response('json');
        });

        $formRequest = Request::create('/api/v1/employees', 'POST', [
            'name' => "Ra\x08fi",
            'profile' => [
                'city' => "Jaka\x7Frta",
            ],
        ]);

        (new SanitizeRequestInput())->handle($formRequest, function (Request $request): Response {
            $this->assertSame('Rafi', $request->request->get('name'));
            $this->assertSame('Jakarta', data_get($request->request->all(), 'profile.city'));

            return new Response('form');
        });
    }

    public function test_secure_headers_add_security_headers_and_hsts_for_secure_requests(): void
    {
        config()->set('security.headers.hsts_max_age', 600);

        $request = Request::create('https://enterprise-hris.local/api/v1/dashboard', 'GET');

        $response = (new SecureHeaders())->handle(
            $request,
            static fn (): Response => new Response('ok'),
        );

        $this->assertSame("default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-ancestors 'none'; img-src 'self' data: blob:; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests", $response->headers->get('Content-Security-Policy'));
        $this->assertSame('DENY', $response->headers->get('X-Frame-Options'));
        $this->assertSame('1; mode=block', $response->headers->get('X-XSS-Protection'));
        $this->assertSame('max-age=600; includeSubDomains; preload', $response->headers->get('Strict-Transport-Security'));
    }

    public function test_secure_headers_skip_hsts_for_plain_http_requests(): void
    {
        $request = Request::create('http://enterprise-hris.local/api/v1/dashboard', 'GET');

        $response = (new SecureHeaders())->handle(
            $request,
            static fn (): Response => new Response('ok'),
        );

        $this->assertNull($response->headers->get('Strict-Transport-Security'));
        $this->assertSame('same-origin', $response->headers->get('Cross-Origin-Opener-Policy'));
        $this->assertSame('strict-origin-when-cross-origin', $response->headers->get('Referrer-Policy'));
    }
}
