import test from "node:test";
import assert from "node:assert/strict";
import { auditTestUtils } from "../src/services/audit.js";
import { metricsTestUtils, recordHttpMetric, renderMetrics } from "../src/services/metrics.js";
import { env } from "../src/config/env.js";
import { isPasskeyRequiredRole, isPasskeyStepUpAction } from "../src/services/passkeys.js";
import { cookieValue, issueSessionCookie, rotateSessionCookie } from "../src/services/session.js";
import { verifyAccessToken } from "../src/services/tokens.js";
import { accountIsLocked } from "../src/services/loginProtection.js";
import { assertPasswordNotReused } from "../src/services/passwordHistory.js";
import { hasRecentPasskey, requireRecentPasskey, requireRecentPasskeyFor } from "../src/middleware/auth.js";
import bcrypt from "bcryptjs";

test("tanda tangan audit deterministik dan berubah saat data dimanipulasi", () => {
  const base = {
    previousHash: null,
    userId: 7,
    action: "ARCHIVE_VIEW",
    entity: "archive",
    entityId: 31,
    metadata: { requestId: "req-1", result: "allowed" },
    createdAt: "2026-08-15T03:00:00.000Z",
    key: "kunci-audit-pengujian-yang-panjang"
  };
  const first = auditTestUtils.entrySignature(base);
  const repeated = auditTestUtils.entrySignature({ ...base, metadata: { result: "allowed", requestId: "req-1" } });
  const tampered = auditTestUtils.entrySignature({ ...base, metadata: { ...base.metadata, result: "denied" } });

  assert.equal(first, repeated);
  assert.notEqual(first, tampered);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test("hash audit berikutnya terikat pada hash sebelumnya", () => {
  const entry = {
    userId: 1,
    action: "LOGIN_SUCCESS",
    entity: "auth",
    entityId: null,
    metadata: {},
    createdAt: "2026-08-15T03:00:00.000Z",
    key: "kunci-audit-pengujian-yang-panjang"
  };
  const genesis = auditTestUtils.entrySignature({ ...entry, previousHash: null });
  const chained = auditTestUtils.entrySignature({ ...entry, previousHash: genesis });

  assert.notEqual(genesis, chained);
});

test("metrik merangkum URL tidak dikenal untuk mencegah high-cardinality", () => {
  const req = { method: "GET", path: "/probe/unik-dari-penyerang" };
  assert.equal(metricsTestUtils.normalizedPath(req), "/unmatched");
  recordHttpMetric(req, { statusCode: 404 }, 0.01);
  assert.match(renderMetrics(), /route="\/unmatched"/);
});

test("kewajiban passkey mengikuti role yang dikonfigurasi", () => {
  const original = env.passkeyRequiredRoles;
  env.passkeyRequiredRoles = ["Admin", "Inspektur"];
  try {
    assert.equal(isPasskeyRequiredRole("Admin"), true);
    assert.equal(isPasskeyRequiredRole("Umpeg"), false);
  } finally {
    env.passkeyRequiredRoles = original;
  }
});

test("sesi browser diterbitkan sebagai cookie HttpOnly dan dapat dibaca server", async () => {
  const headers = [];
  const statements = [];
  const response = { append(name, value) { headers.push([name, value]); } };
  const fakeClient = {
    async query(statement) {
      statements.push(statement);
      return { rows: [], rowCount: statement.includes("concurrent_session_limit") ? 2 : 0 };
    }
  };
  const result = await issueSessionCookie(response, {
    id: 7,
    role: "Admin",
    token_version: 3,
    mfaVerified: true,
    authenticationMethods: ["pwd", "webauthn"]
  }, { client: fakeClient });

  const serialized = headers[0][1];
  assert.match(serialized, /HttpOnly/);
  assert.match(serialized, /SameSite=Strict/);
  assert.match(serialized, /Priority=High/);
  const cookiePair = serialized.split(";", 1)[0];
  const token = cookieValue({ headers: { cookie: cookiePair } });
  assert.ok(token.length > 40);
  const payload = verifyAccessToken(token);
  assert.match(payload.jti, /^[0-9a-f-]{36}$/);
  assert.deepEqual(payload.amr, ["pwd", "webauthn"]);
  assert.equal(result.revokedBySessionLimit, 2);
  assert.ok(statements.some((statement) => statement.includes("idle_timeout")));
  assert.ok(statements.some((statement) => statement.includes("ROW_NUMBER()")));
});

test("status lock akun mengikuti waktu kedaluwarsa", () => {
  assert.equal(accountIsLocked({ login_locked_until: new Date(Date.now() + 60000) }), true);
  assert.equal(accountIsLocked({ login_locked_until: new Date(Date.now() - 1000) }), false);
  assert.equal(accountIsLocked(null), false);
});

test("password history menolak penggunaan ulang password lama", async () => {
  const oldHash = await bcrypt.hash("PasswordLama2026", 4);
  const historicalHash = await bcrypt.hash("PasswordLebihLama2025", 4);
  const fakeClient = { async query() { return { rows: [{ password_hash: historicalHash }] }; } };

  await assert.rejects(
    assertPasswordNotReused(fakeClient, 7, "PasswordLama2026", oldHash),
    /password saat ini/i
  );
  await assert.rejects(
    assertPasswordNotReused(fakeClient, 7, "PasswordLebihLama2025", oldHash),
    /password sebelumnya/i
  );
  await assert.doesNotReject(
    assertPasswordNotReused(fakeClient, 7, "PasswordBaruSekali2027", oldHash)
  );
});

test("operasi istimewa mensyaratkan autentikasi passkey yang masih baru", () => {
  const original = env.privilegedReauthMaxAgeSeconds;
  env.privilegedReauthMaxAgeSeconds = 900;
  try {
    let accepted = null;
    requireRecentPasskey({
      user: {
        authenticationMethods: ["pwd", "webauthn"],
        authenticationTime: Math.floor(Date.now() / 1000) - 60
      }
    }, {}, (error) => { accepted = error || null; });
    assert.equal(accepted, null);

    let missingPasskey;
    requireRecentPasskey({
      user: {
        authenticationMethods: ["pwd", "totp"],
        authenticationTime: Math.floor(Date.now() / 1000) - 60
      }
    }, {}, (error) => { missingPasskey = error; });
    assert.equal(missingPasskey.status, 403);

    let stalePasskey;
    requireRecentPasskey({
      user: {
        authenticationMethods: ["pwd", "webauthn"],
        authenticationTime: Math.floor(Date.now() / 1000) - 901
      }
    }, {}, (error) => { stalePasskey = error; });
    assert.equal(stalePasskey.status, 403);
  } finally {
    env.privilegedReauthMaxAgeSeconds = original;
  }
});

test("otorisasi step-up passkey terikat pada jenis operasi", () => {
  const now = Math.floor(Date.now() / 1000);
  const user = {
    authenticationMethods: ["pwd", "webauthn"],
    authenticationTime: now - 30,
    stepUpAction: "backup-export"
  };

  assert.equal(hasRecentPasskey(user, now, "backup-export"), true);
  assert.equal(hasRecentPasskey(user, now, "backup-restore"), false);
  assert.equal(isPasskeyStepUpAction("reset-mfa"), true);
  assert.equal(isPasskeyStepUpAction("arbitrary-admin-action"), false);

  let rejected;
  requireRecentPasskeyFor("backup-restore")({ user }, {}, (error) => { rejected = error; });
  assert.equal(rejected.status, 403);
  assert.deepEqual(rejected.details, {
    code: "PASSKEY_STEP_UP_REQUIRED",
    action: "backup-restore",
    maxAgeMinutes: Math.ceil(env.privilegedReauthMaxAgeSeconds / 60)
  });
});

test("rotasi step-up mencabut sesi lama dan menerbitkan cookie baru", async () => {
  const statements = [];
  const headers = [];
  const fakeClient = {
    async query(statement) {
      statements.push(statement);
      if (statement.includes("passkey_step_up_rotation")) return { rows: [{ id: 91 }], rowCount: 1 };
      return { rows: [], rowCount: 0 };
    }
  };
  const response = { append(name, value) { headers.push([name, value]); } };

  const rotation = await rotateSessionCookie(fakeClient, response, {
    id: 7,
    role: "Admin",
    tokenVersion: 3,
    authenticationMethods: ["pwd", "totp"]
  }, {
    currentSessionDbId: 91,
    stepUpAction: "reset-mfa"
  });

  assert.ok(statements.some((statement) => statement.includes("passkey_step_up_rotation")));
  assert.ok(statements.some((statement) => statement.includes("step_up_action")));
  assert.equal(headers.length, 0);
  const token = cookieValue({ headers: { cookie: rotation.cookieHeader.split(";", 1)[0] } });
  const payload = verifyAccessToken(token);
  assert.deepEqual(payload.amr, ["pwd", "totp", "webauthn"]);
});
