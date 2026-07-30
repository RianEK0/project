import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loginSchema } from '@nova/validation';
import type { Request, Response } from 'express';

import { ERROR_CODES } from '@/common/constants/error-codes';
import { AppException } from '@/common/exceptions/app.exception';

type TokenKind = 'access';

type AccessTokenPayload = {
  sub: string;
  email: string;
  type: TokenKind;
  iat: number;
  exp: number;
};

type AuthenticatedUserProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
  locale: string;
  timezone: string;
  activeOrganizationId: string | null;
  activeWorkspaceId: string | null;
};

type AuthenticatedMembership = {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  workspace: {
    id: string;
    name: string;
    slug: string;
  } | null;
  roles: string[];
};

type AuthenticatedUser = {
  id: string;
  email: string;
  status: string;
  lastLoginAt: string | null;
  profile: AuthenticatedUserProfile | null;
  memberships: AuthenticatedMembership[];
};

type DemoUserRecord = {
  id: string;
  email: string;
  password: string;
  status: 'ACTIVE';
  profile: AuthenticatedUserProfile;
  memberships: AuthenticatedMembership[];
};

type RefreshSession = {
  userId: string;
  email: string;
  expiresAt: number;
  revokedAt: number | null;
};

const ACCESS_TOKEN_STORAGE_TYPE = 'access';
const DEMO_PASSWORD = 'NovaERP@123';
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;

const DEMO_ORGANIZATION = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'NovaERP Demo Company',
  slug: 'novaerp-demo-company',
};

const DEMO_WORKSPACE = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Main Workspace',
  slug: 'main-workspace',
};

function createDemoUser(
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  displayName: string,
  roles: string[],
): DemoUserRecord {
  return {
    id,
    email,
    password: DEMO_PASSWORD,
    status: 'ACTIVE',
    profile: {
      firstName,
      lastName,
      displayName,
      locale: 'id',
      timezone: 'Asia/Jakarta',
      activeOrganizationId: DEMO_ORGANIZATION.id,
      activeWorkspaceId: DEMO_WORKSPACE.id,
    },
    memberships: [
      {
        organization: DEMO_ORGANIZATION,
        workspace: DEMO_WORKSPACE,
        roles,
      },
    ],
  };
}

const DEMO_USERS = [
  createDemoUser(
    '00000000-0000-4000-8000-000000000001',
    'superadmin@novaerp.local',
    'Super',
    'Admin',
    'Super Admin',
    ['super-admin'],
  ),
  createDemoUser(
    '00000000-0000-4000-8000-000000000002',
    'owner@novaerp.local',
    'Olivia',
    'Owner',
    'Olivia Owner',
    ['owner'],
  ),
  createDemoUser(
    '00000000-0000-4000-8000-000000000003',
    'admin@novaerp.local',
    'Avery',
    'Admin',
    'Avery Admin',
    ['admin'],
  ),
  createDemoUser(
    '00000000-0000-4000-8000-000000000004',
    'manager@novaerp.local',
    'Mason',
    'Manager',
    'Mason Manager',
    ['manager'],
  ),
  createDemoUser(
    '00000000-0000-4000-8000-000000000005',
    'staff@novaerp.local',
    'Sofia',
    'Staff',
    'Sofia Staff',
    ['staff'],
  ),
  createDemoUser(
    '00000000-0000-4000-8000-000000000006',
    'viewer@novaerp.local',
    'Victor',
    'Viewer',
    'Victor Viewer',
    ['viewer'],
  ),
];

const DEMO_USERS_BY_EMAIL = new Map(DEMO_USERS.map((user) => [user.email, user]));
const DEMO_USERS_BY_ID = new Map(DEMO_USERS.map((user) => [user.id, user]));

@Injectable()
export class AuthService {
  private readonly failedLoginCounts = new Map<string, number>();
  private readonly lockedUntilByEmail = new Map<string, number>();
  private readonly lastLoginAtByUserId = new Map<string, string>();
  private readonly refreshSessions = new Map<string, RefreshSession>();

  constructor(private readonly configService: ConfigService) {}

  async login(
    input: {
      email?: string;
      password?: string;
    },
    request: Request,
    response: Response,
  ) {
    const credentials = loginSchema.safeParse(input);

    if (!credentials.success) {
      throw new AppException(
        ERROR_CODES.VALIDATION_ERROR,
        'Email and password are required.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const email = credentials.data.email.trim().toLowerCase();
    const password = credentials.data.password;
    const user = DEMO_USERS_BY_EMAIL.get(email) ?? null;
    const lockedUntil = this.lockedUntilByEmail.get(email) ?? null;

    if (lockedUntil && lockedUntil > Date.now()) {
      throw new AppException(
        ERROR_CODES.ACCOUNT_LOCKED,
        `Account is locked until ${new Date(lockedUntil).toISOString()}.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user || !this.isPasswordValid(password, user.password)) {
      const failedLoginCount = (this.failedLoginCounts.get(email) ?? 0) + 1;
      this.failedLoginCounts.set(email, failedLoginCount);

      if (failedLoginCount >= MAX_FAILED_LOGINS) {
        const lockedUntilMs = this.buildLockoutDate().getTime();
        this.lockedUntilByEmail.set(email, lockedUntilMs);

        throw new AppException(
          ERROR_CODES.ACCOUNT_LOCKED,
          `Account locked for ${LOCKOUT_MINUTES} minutes due to repeated failed logins.`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new AppException(
        ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.failedLoginCounts.delete(email);
    this.lockedUntilByEmail.delete(email);

    const lastLoginAt = new Date().toISOString();
    this.lastLoginAtByUserId.set(user.id, lastLoginAt);

    const accessToken = this.createAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenHash = this.hashOpaqueToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + this.parseDurationToMs(this.refreshExpiresIn()));

    this.refreshSessions.set(refreshTokenHash, {
      userId: user.id,
      email: user.email,
      expiresAt: refreshExpiresAt.getTime(),
      revokedAt: null,
    });

    this.setRefreshCookie(response, refreshToken, refreshExpiresAt);

    return {
      accessToken,
      user: this.mapAuthenticatedUser(user),
    };
  }

  async refresh(request: Request, response: Response) {
    const refreshToken = this.readRefreshTokenFromCookie(request);

    if (!refreshToken) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Refresh token cookie is missing.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const refreshTokenRecord = this.refreshSessions.get(this.hashOpaqueToken(refreshToken)) ?? null;

    if (
      !refreshTokenRecord ||
      refreshTokenRecord.revokedAt !== null ||
      refreshTokenRecord.expiresAt <= Date.now()
    ) {
      this.clearRefreshCookie(response);
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Refresh token is invalid or expired.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = DEMO_USERS_BY_ID.get(refreshTokenRecord.userId) ?? null;

    if (!user) {
      this.clearRefreshCookie(response);
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'User session is no longer active.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const accessToken = this.createAccessToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: this.mapAuthenticatedUser(user),
    };
  }

  async getCurrentUser(request: Request) {
    const token = this.readAccessTokenFromRequest(request);
    const payload = this.verifyAccessToken(token);
    const user =
      DEMO_USERS_BY_ID.get(payload.sub) ?? DEMO_USERS_BY_EMAIL.get(payload.email) ?? null;

    if (!user) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'User session is no longer active.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      user: this.mapAuthenticatedUser(user),
    };
  }

  async logout(request: Request, response: Response) {
    const refreshToken = this.readRefreshTokenFromCookie(request);

    if (refreshToken) {
      const refreshTokenHash = this.hashOpaqueToken(refreshToken);
      const session = this.refreshSessions.get(refreshTokenHash);

      if (session) {
        session.revokedAt = Date.now();
        this.refreshSessions.set(refreshTokenHash, session);
      }
    }

    this.clearRefreshCookie(response);

    return {
      message: 'Signed out successfully.',
    };
  }

  private isPasswordValid(candidate: string, expected: string) {
    const candidateBuffer = Buffer.from(candidate);
    const expectedBuffer = Buffer.from(expected);

    return (
      candidateBuffer.length === expectedBuffer.length &&
      timingSafeEqual(candidateBuffer, expectedBuffer)
    );
  }

  private createAccessToken(input: { sub: string; email: string }) {
    const nowSeconds = Math.floor(Date.now() / 1_000);
    const payload: AccessTokenPayload = {
      sub: input.sub,
      email: input.email,
      type: ACCESS_TOKEN_STORAGE_TYPE,
      iat: nowSeconds,
      exp: nowSeconds + Math.floor(this.parseDurationToMs(this.accessExpiresIn()) / 1_000),
    };

    return this.signToken(payload, this.accessSecret());
  }

  private verifyAccessToken(token: string | null) {
    if (!token) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Authorization token is missing.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Authorization token is malformed.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.base64UrlEncode(
      createHmac('sha256', this.accessSecret()).update(signingInput).digest(),
    );

    const actualSignatureBuffer = Buffer.from(encodedSignature);
    const expectedSignatureBuffer = Buffer.from(expectedSignature);

    if (
      actualSignatureBuffer.length !== expectedSignatureBuffer.length ||
      !timingSafeEqual(actualSignatureBuffer, expectedSignatureBuffer)
    ) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Authorization token signature is invalid.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = JSON.parse(
      this.base64UrlDecode(encodedPayload).toString('utf8'),
    ) as AccessTokenPayload;

    if (
      payload.type !== ACCESS_TOKEN_STORAGE_TYPE ||
      payload.exp <= Math.floor(Date.now() / 1_000)
    ) {
      throw new AppException(
        ERROR_CODES.UNAUTHORIZED,
        'Authorization token has expired.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return payload;
  }

  private signToken(payload: AccessTokenPayload, secret: string) {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(Buffer.from(JSON.stringify(header)));
    const encodedPayload = this.base64UrlEncode(Buffer.from(JSON.stringify(payload)));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = this.base64UrlEncode(
      createHmac('sha256', secret).update(signingInput).digest(),
    );

    return `${signingInput}.${signature}`;
  }

  private base64UrlEncode(value: Buffer) {
    return value.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  private base64UrlDecode(value: string) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    return Buffer.from(`${normalized}${padding}`, 'base64');
  }

  private parseDurationToMs(duration: string) {
    const match = duration.match(/^(\d+)([smhd])$/i);

    if (!match) {
      throw new AppException(
        ERROR_CODES.INTERNAL_SERVER_ERROR,
        `Unsupported duration format: ${duration}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const amount = Number(match[1]);
    const unit = match[2]?.toLowerCase();

    switch (unit) {
      case 's':
        return amount * 1_000;
      case 'm':
        return amount * 60_000;
      case 'h':
        return amount * 3_600_000;
      case 'd':
        return amount * 86_400_000;
      default:
        throw new AppException(
          ERROR_CODES.INTERNAL_SERVER_ERROR,
          `Unsupported duration unit: ${unit}.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  private hashOpaqueToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private readAccessTokenFromRequest(request: Request) {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    return authorization.slice('Bearer '.length).trim();
  }

  private readRefreshTokenFromCookie(request: Request) {
    const cookieName = this.cookieName();
    const cookies = request.cookies as Record<string, string | undefined> | undefined;
    return cookies?.[cookieName] ?? null;
  }

  private setRefreshCookie(response: Response, token: string, expiresAt: Date) {
    response.cookie(this.cookieName(), token, {
      httpOnly: true,
      secure: this.cookieSecure(),
      sameSite: this.cookieSameSite(),
      expires: expiresAt,
      path: '/',
      ...(this.cookieDomain() ? { domain: this.cookieDomain() } : {}),
    });
  }

  private clearRefreshCookie(response: Response) {
    response.clearCookie(this.cookieName(), {
      httpOnly: true,
      secure: this.cookieSecure(),
      sameSite: this.cookieSameSite(),
      path: '/',
      ...(this.cookieDomain() ? { domain: this.cookieDomain() } : {}),
    });
  }

  private cookieDomain() {
    const domain = this.configService.getOrThrow<string>('COOKIE_DOMAIN').trim();
    return domain === 'localhost' || domain === '127.0.0.1' ? undefined : domain;
  }

  private cookieSameSite(): 'lax' | 'strict' | 'none' {
    return this.configService.getOrThrow<'lax' | 'strict' | 'none'>('COOKIE_SAME_SITE');
  }

  private cookieSecure() {
    return this.configService.getOrThrow<boolean>('COOKIE_SECURE');
  }

  private cookieName() {
    return this.configService.getOrThrow<string>('COOKIE_NAME');
  }

  private accessSecret() {
    return this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
  }

  private accessExpiresIn() {
    return this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRES_IN');
  }

  private refreshExpiresIn() {
    return this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
  }

  private buildLockoutDate() {
    return new Date(Date.now() + LOCKOUT_MINUTES * 60_000);
  }

  private mapAuthenticatedUser(user: DemoUserRecord): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      status: user.status,
      lastLoginAt: this.lastLoginAtByUserId.get(user.id) ?? null,
      profile: user.profile,
      memberships: user.memberships,
    };
  }
}
