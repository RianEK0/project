import { describe, expect, it } from 'vitest';

import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  it('parses a valid environment payload', () => {
    const parsed = validateEnvironment({
      NODE_ENV: 'development',
      API_PORT: '4000',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/novaerp',
      REDIS_URL: 'redis://localhost:6379',
      JWT_ACCESS_SECRET: '12345678901234567890',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_SECRET: 'abcdefghijklmnopqrstuvwxyz',
      JWT_REFRESH_EXPIRES_IN: '7d',
      COOKIE_NAME: 'novaerp_refresh_token',
      COOKIE_DOMAIN: 'localhost',
      COOKIE_SECURE: 'false',
      COOKIE_SAME_SITE: 'lax',
      CORS_ORIGINS: 'http://localhost:3000',
      SMTP_HOST: 'mailpit',
      SMTP_PORT: '1025',
      SMTP_USER: '',
      SMTP_PASSWORD: '',
      SMTP_FROM_EMAIL: 'no-reply@novaerp.local',
      SMTP_FROM_NAME: 'NovaERP',
      EMAIL_VERIFICATION_EXPIRES_IN: '24h',
      PASSWORD_RESET_EXPIRES_IN: '1h',
      INVITATION_EXPIRES_IN: '7d',
      RATE_LIMIT_TTL: '60',
      RATE_LIMIT_MAX: '20',
      LOG_LEVEL: 'debug',
    });

    expect(parsed.API_PORT).toBe(4000);
    expect(parsed.COOKIE_SECURE).toBe(false);
    expect(parsed.SMTP_PORT).toBe(1025);
  });
});

