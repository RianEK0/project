import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(20),
  JWT_ACCESS_EXPIRES_IN: z.string().min(2),
  JWT_REFRESH_SECRET: z.string().min(20),
  JWT_REFRESH_EXPIRES_IN: z.string().min(2),
  COOKIE_NAME: z.string().min(3),
  COOKIE_DOMAIN: z.string().min(1),
  COOKIE_SECURE: z.enum(['true', 'false']).default('false').transform((value) => value === 'true'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  CORS_ORIGINS: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM_EMAIL: z.string().email(),
  SMTP_FROM_NAME: z.string().min(1),
  EMAIL_VERIFICATION_EXPIRES_IN: z.string().min(2),
  PASSWORD_RESET_EXPIRES_IN: z.string().min(2),
  INVITATION_EXPIRES_IN: z.string().min(2),
  RATE_LIMIT_TTL: z.coerce.number().int().positive(),
  RATE_LIMIT_MAX: z.coerce.number().int().positive(),
  LOG_LEVEL: z.string().min(1),
});

export type AppEnvironment = z.infer<typeof envSchema>;

export function validateEnvironment(config: Record<string, unknown>): AppEnvironment {
  return envSchema.parse(config);
}
