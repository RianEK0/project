import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { recordSecurityEvent } from "../services/securityEvents.js";
import { recordHttpMetric } from "../services/metrics.js";
import { cookieValue } from "../services/session.js";
import {
  addSecurityStrike,
  decrementSecurityCounter,
  getSecurityBlock,
  incrementSecurityCounter,
  listSecurityBlocks,
  setSecurityBlock
} from "../services/securityState.js";

const HONEYPOT_PATHS = [
  /^\/(?:\.env|\.git|wp-admin|wp-login\.php|phpmyadmin|adminer)(?:\/|$)/i,
  /^\/api\/(?:internal\/debug|debug|shell|console)(?:\/|$)/i
];

const ATTACK_SIGNATURES = [
  { rule: "PATH_TRAVERSAL", pattern: /(?:\.\.\/|\.\.\\|%2e%2e(?:%2f|\/|%5c))/i },
  { rule: "XSS_PROBE", pattern: /(?:<|%3c)script\b|javascript\s*:/i },
  { rule: "SQL_INJECTION_PROBE", pattern: /(?:union(?:\s|%20|\+)+select|(?:'|%27)(?:\s|%20|\+)+(?:or|and)(?:\s|%20|\+)+['"]?\d+['"]?\s*=)/i },
  { rule: "COMMAND_INJECTION_PROBE", pattern: /(?:\/bin\/(?:sh|bash)|(?:;|%3b)(?:\s|%20)*(?:cat|curl|wget)(?:\s|%20)|\$\{jndi:)/i },
  { rule: "NULL_BYTE_PROBE", pattern: /%00|\u0000/i }
];

function cleanLogValue(value) {
  return String(value ?? "-")
    .replace(/[\r\n\t\u0000-\u001f\u007f]/g, "_")
    .slice(0, 300);
}

export function requestContext(req, res, next) {
  const suppliedRequestId = req.get("x-request-id");
  const requestId = suppliedRequestId && /^[a-zA-Z0-9._-]{8,80}$/.test(suppliedRequestId)
    ? suppliedRequestId
    : randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.setHeader("Cache-Control", "no-store");
  next();
}

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const requestPath = req.path;

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    recordHttpMetric(req, res, durationMs / 1000);
    const line = [
      cleanLogValue(req.requestId),
      cleanLogValue(req.ip),
      cleanLogValue(req.method),
      cleanLogValue(requestPath),
      res.statusCode,
      `${durationMs.toFixed(1)}ms`
    ].join(" ");
    console.info(line);
  });

  next();
}

function clientKey(req) {
  return String(req?.ip || "unknown").slice(0, 64);
}

async function registerSecurityStrikeInternal(req, {
  type = "SUSPICIOUS_REQUEST",
  severity = "medium",
  weight = 1,
  metadata = {}
} = {}) {
  const key = clientKey(req);
  const normalizedWeight = Math.max(1, Number(weight) || 1);
  let strikeCount = 0;
  for (let index = 0; index < normalizedWeight; index += 1) {
    const state = await addSecurityStrike(key, env.securityStrikeWindowMs);
    strikeCount = state.count;
  }

  let blockedUntil = null;
  if (strikeCount >= env.securityBlockThreshold) {
    const block = await setSecurityBlock(key, {
      ipAddress: key,
      reason: type,
      strikeCount
    }, env.securityBlockDurationMs);
    blockedUntil = block.blockedUntil;
  }

  await recordSecurityEvent({
    type,
    severity,
    req,
    metadata: {
      ...metadata,
      strikeCount,
      blockedUntil: blockedUntil ? new Date(blockedUntil).toISOString() : null
    }
  });
  return { strikeCount, blockedUntil };
}

export function registerSecurityStrike(req, options) {
  const operation = registerSecurityStrikeInternal(req, options);
  operation.catch((error) => console.error(`Gagal mencatat security strike: ${error.code || error.message}`));
  return operation;
}

async function blockClientInternal(req, { type, severity = "high", metadata = {} }) {
  const key = clientKey(req);
  const block = await setSecurityBlock(key, {
    ipAddress: key,
    reason: type,
    strikeCount: env.securityBlockThreshold
  }, env.securityBlockDurationMs);
  await recordSecurityEvent({
    type,
    severity,
    req,
    metadata: { ...metadata, blockedUntil: new Date(block.blockedUntil).toISOString() }
  });
}

export function blockClient(req, options) {
  const operation = blockClientInternal(req, options);
  operation.catch((error) => console.error(`Gagal mencatat blokir klien: ${error.code || error.message}`));
  return operation;
}

export async function getActiveBlocks() {
  const blocks = await listSecurityBlocks();
  return blocks.map((entry) => ({
    ...entry,
    blockedAt: new Date(entry.blockedAt).toISOString(),
    blockedUntil: new Date(entry.blockedUntil).toISOString()
  }));
}

export function detectAttackSignature(value) {
  const candidate = String(value || "").slice(0, 4000);
  return ATTACK_SIGNATURES.find(({ pattern }) => pattern.test(candidate))?.rule || null;
}

export function honeypotGuard(req, res, next) {
  let requestPath = req.path;
  try {
    requestPath = decodeURIComponent(requestPath);
  } catch {
    // Path yang tidak dapat di-decode tetap diperiksa dalam bentuk mentah.
  }

  if (!HONEYPOT_PATHS.some((pattern) => pattern.test(requestPath))) return next();

  void blockClient(req, {
    type: "HONEYPOT_TRIGGERED",
    severity: "high",
    metadata: { userAgent: req.get("user-agent") || "" }
  }).catch((error) => console.error(`Gagal mencatat blokir honeypot: ${error.code || error.message}`));
  return res.status(404).json({ message: "Endpoint tidak ditemukan", requestId: req.requestId });
}

export function blockedClientGuard(req, res, next) {
  const key = clientKey(req);
  void getSecurityBlock(key)
    .then((entry) => {
      if (!entry || entry.blockedUntil <= Date.now()) return next();
      res.setHeader("Retry-After", Math.max(Math.ceil((entry.blockedUntil - Date.now()) / 1000), 1));
      return res.status(403).json({
        message: "Permintaan diblokir sementara karena aktivitas mencurigakan.",
        requestId: req.requestId
      });
    })
    .catch((error) => {
      error.status = 503;
      next(error);
    });
}

export function attackDetectionGuard(req, res, next) {
  const inspectedValue = `${req.originalUrl || req.url || ""}\n${req.get("user-agent") || ""}`;
  const rule = detectAttackSignature(inspectedValue);
  if (!rule) return next();

  void registerSecurityStrike(req, {
    type: rule,
    severity: "high",
    weight: 2,
    metadata: { userAgent: req.get("user-agent") || "" }
  }).catch((error) => console.error(`Gagal mencatat signature serangan: ${error.code || error.message}`));
  return res.status(403).json({
    message: "Permintaan ditolak oleh sistem keamanan.",
    requestId: req.requestId
  });
}

export function originMutationGuard(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = String(req.get("origin") || "").replace(/\/$/, "");
  const fetchSite = String(req.get("sec-fetch-site") || "").toLowerCase();
  const allowedOrigin = origin && env.frontendUrls.includes(origin);
  const hasBearerToken = String(req.get("authorization") || "").startsWith("Bearer ");
  const unverifiableCookieMutation = !origin && !fetchSite && Boolean(cookieValue(req)) && !hasBearerToken;

  // Browser mengirim Origin atau Fetch Metadata pada mutasi. Request non-browser
  // tanpa kedua header tetap dapat memakai Bearer token untuk otomasi resmi.
  if ((origin && !allowedOrigin) || fetchSite === "cross-site" || unverifiableCookieMutation) {
    void registerSecurityStrike(req, {
      type: "CROSS_SITE_MUTATION_BLOCKED",
      severity: "high",
      metadata: { origin: origin || "missing", fetchSite: fetchSite || "missing" }
    }).catch((error) => console.error(`Gagal mencatat mutasi lintas situs: ${error.code || error.message}`));
    return res.status(403).json({ message: "Permintaan lintas situs ditolak", requestId: req.requestId });
  }
  return next();
}

export function createRateLimiter({ scope = "custom", windowMs, max, keyGenerator, message, skipSuccessfulRequests = false, onLimit }) {
  return (req, res, next) => {
    void (async () => {
      const key = String(keyGenerator ? keyGenerator(req) : req.ip || "unknown").slice(0, 400);
      const entry = await incrementSecurityCounter(scope, key, windowMs);

      if (skipSuccessfulRequests && typeof res.once === "function") {
        res.once("finish", () => {
          if (res.statusCode < 400) {
            void decrementSecurityCounter(scope, key)
              .catch((error) => console.error(`Gagal mengurangi counter keamanan: ${error.code || error.message}`));
          }
        });
      }

      const remaining = Math.max(max - entry.count, 0);
      res.setHeader("RateLimit-Limit", max);
      res.setHeader("RateLimit-Remaining", remaining);
      res.setHeader("RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

      if (entry.count > max) {
        if (entry.count === max + 1) await onLimit?.(req);
        const retryAfter = Math.max(Math.ceil((entry.resetAt - Date.now()) / 1000), 1);
        res.setHeader("Retry-After", retryAfter);
        return res.status(429).json({ message });
      }

      return next();
    })().catch((error) => {
      error.status = 503;
      next(error);
    });
  };
}

export const apiRateLimit = createRateLimiter({
  scope: "api",
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: "Terlalu banyak permintaan. Silakan coba kembali beberapa saat lagi.",
  onLimit: (req) => registerSecurityStrike(req, {
    type: "API_RATE_LIMIT",
    severity: "medium",
    weight: 2
  })
});

export const loginRateLimit = createRateLimiter({
  scope: "login",
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip || "unknown"}:${String(req.body?.identifier || "").trim().toLowerCase()}`,
  message: "Terlalu banyak percobaan login. Silakan coba kembali dalam 15 menit.",
  onLimit: (req) => registerSecurityStrike(req, {
    type: "LOGIN_RATE_LIMIT",
    severity: "high",
    weight: 2
  })
});

export const mfaRateLimit = createRateLimiter({
  scope: "mfa",
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip || "unknown",
  message: "Terlalu banyak percobaan verifikasi MFA. Silakan coba kembali dalam 15 menit.",
  onLimit: (req) => registerSecurityStrike(req, {
    type: "MFA_RATE_LIMIT",
    severity: "high",
    weight: 2
  })
});
