<?php

return [
    'access_token_ttl_minutes' => (int) env('SECURITY_ACCESS_TOKEN_TTL_MINUTES', 15),
    'refresh_token_ttl_days' => (int) env('SECURITY_REFRESH_TOKEN_TTL_DAYS', 1),
    'remember_refresh_token_ttl_days' => (int) env('SECURITY_REMEMBER_REFRESH_TOKEN_TTL_DAYS', 30),
    'password_history_limit' => (int) env('SECURITY_PASSWORD_HISTORY_LIMIT', 5),
    'force_https' => env('SECURITY_FORCE_HTTPS', env('APP_ENV') === 'production'),
    'captcha' => [
        'length' => (int) env('SECURITY_CAPTCHA_LENGTH', 6),
        'ttl_minutes' => (int) env('SECURITY_CAPTCHA_TTL_MINUTES', 10),
    ],
    'headers' => [
        'hsts_max_age' => (int) env('SECURITY_HSTS_MAX_AGE', 31536000),
    ],
    'lockout' => [
        'max_attempts' => (int) env('SECURITY_LOCKOUT_MAX_ATTEMPTS', 5),
        'duration_minutes' => (int) env('SECURITY_LOCKOUT_DURATION_MINUTES', 15),
    ],
    'rate_limits' => [
        'api' => [
            'per_minute' => (int) env('SECURITY_RATE_LIMIT_API_PER_MINUTE', 120),
        ],
        'auth' => [
            'captcha_per_minute' => (int) env('SECURITY_RATE_LIMIT_AUTH_CAPTCHA_PER_MINUTE', 30),
            'login_per_minute' => (int) env('SECURITY_RATE_LIMIT_AUTH_LOGIN_PER_MINUTE', 5),
            'two_factor_per_minute' => (int) env('SECURITY_RATE_LIMIT_AUTH_TWO_FACTOR_PER_MINUTE', 6),
            'refresh_per_minute' => (int) env('SECURITY_RATE_LIMIT_AUTH_REFRESH_PER_MINUTE', 20),
            'forgot_password_per_hour' => (int) env('SECURITY_RATE_LIMIT_AUTH_FORGOT_PASSWORD_PER_HOUR', 5),
            'reset_password_per_hour' => (int) env('SECURITY_RATE_LIMIT_AUTH_RESET_PASSWORD_PER_HOUR', 10),
            'email_verification_per_hour' => (int) env('SECURITY_RATE_LIMIT_AUTH_EMAIL_VERIFICATION_PER_HOUR', 6),
            'session_management_per_minute' => (int) env('SECURITY_RATE_LIMIT_AUTH_SESSION_MANAGEMENT_PER_MINUTE', 20),
            'two_factor_management_per_hour' => (int) env('SECURITY_RATE_LIMIT_AUTH_TWO_FACTOR_MANAGEMENT_PER_HOUR', 10),
            'change_password_per_hour' => (int) env('SECURITY_RATE_LIMIT_AUTH_CHANGE_PASSWORD_PER_HOUR', 8),
        ],
    ],
    'two_factor' => [
        'issuer' => env('SECURITY_TOTP_ISSUER', env('APP_NAME', 'Enterprise HRIS')),
        'window' => (int) env('SECURITY_TOTP_WINDOW', 1),
        'digits' => (int) env('SECURITY_TOTP_DIGITS', 6),
        'period' => (int) env('SECURITY_TOTP_PERIOD', 30),
        'recovery_codes' => (int) env('SECURITY_TOTP_RECOVERY_CODES', 8),
    ],
];
