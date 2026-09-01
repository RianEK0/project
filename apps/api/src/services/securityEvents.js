import { query } from "../config/db.js";
import { recordSecurityMetric } from "./metrics.js";

const SENSITIVE_KEY = /password|passphrase|token|authorization|cookie|secret|credential/i;
const EVENT_TYPES = /^[A-Z0-9_]{3,80}$/;
const SEVERITIES = new Set(["low", "medium", "high", "critical"]);

function cleanText(value, maxLength = 300) {
  return String(value ?? "")
    .replace(/[\r\n\t\u0000-\u001f\u007f]/g, "_")
    .slice(0, maxLength);
}

function sanitizeMetadata(value, depth = 0) {
  if (depth > 3 || value === null || value === undefined) return null;
  if (["string", "number", "boolean"].includes(typeof value)) {
    return typeof value === "string" ? cleanText(value, 500) : value;
  }
  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => sanitizeMetadata(item, depth + 1));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 30)
        .map(([key, item]) => [
          cleanText(key, 80),
          SENSITIVE_KEY.test(key) ? "[REDACTED]" : sanitizeMetadata(item, depth + 1)
        ])
    );
  }
  return cleanText(value, 500);
}

function eventPayload({ type, severity = "medium", req, userId, metadata = {} }) {
  return {
    type: EVENT_TYPES.test(type || "") ? type : "SECURITY_EVENT",
    severity: SEVERITIES.has(severity) ? severity : "medium",
    ipAddress: cleanText(req?.ip || "unknown", 64),
    userId: userId || req?.user?.id || null,
    requestId: cleanText(req?.requestId || "", 80) || null,
    method: cleanText(req?.method || "", 12) || null,
    path: cleanText(req?.path || "", 300) || null,
    metadata: sanitizeMetadata(metadata) || {}
  };
}

export async function recordSecurityEvent(input) {
  const event = eventPayload(input);
  recordSecurityMetric(event.type, event.severity);

  // Format satu baris ini sengaja stabil agar dapat dikirim ke SIEM/Fail2ban.
  console.warn(`SECURITY_EVENT ${JSON.stringify(event)}`);

  try {
    const result = await query(
      `INSERT INTO security_events (
         event_type, severity, ip_address, user_id, request_id, method, path, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        event.type,
        event.severity,
        event.ipAddress,
        event.userId,
        event.requestId,
        event.method,
        event.path,
        event.metadata
      ]
    );
    return result.rows[0]?.id || null;
  } catch (error) {
    // Deteksi tidak boleh menjatuhkan API bila database log sedang bermasalah.
    console.error(`SECURITY_EVENT_STORE_FAILED ${cleanText(error.code || error.message, 120)}`);
    return null;
  }
}

export const securityEventUtils = { sanitizeMetadata };
