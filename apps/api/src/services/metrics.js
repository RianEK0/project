const startedAt = Date.now();
const httpMetrics = new Map();
const securityMetrics = new Map();

function safeLabel(value, fallback = "unknown") {
  return String(value || fallback).replace(/[^a-zA-Z0-9_./:-]/g, "_").slice(0, 160);
}

function normalizedPath(req) {
  const routePath = req.route?.path;
  if (routePath) return safeLabel(`${req.baseUrl || ""}${routePath}`);
  // Unmatched URLs are attacker-controlled. Collapsing them prevents a
  // high-cardinality memory denial of service against the in-process metrics.
  return "/unmatched";
}

export function recordHttpMetric(req, res, durationSeconds) {
  const statusClass = `${Math.floor(Number(res.statusCode || 0) / 100)}xx`;
  const key = JSON.stringify([safeLabel(req.method), normalizedPath(req), statusClass]);
  const current = httpMetrics.get(key) || { count: 0, duration: 0 };
  current.count += 1;
  current.duration += durationSeconds;
  httpMetrics.set(key, current);
}

export function recordSecurityMetric(type, severity) {
  const key = JSON.stringify([safeLabel(type), safeLabel(severity)]);
  securityMetrics.set(key, (securityMetrics.get(key) || 0) + 1);
}

function labelString(names, values) {
  return names.map((name, index) => `${name}="${String(values[index]).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`).join(",");
}

export function renderMetrics() {
  const lines = [
    "# HELP sipadi_process_uptime_seconds Process uptime in seconds.",
    "# TYPE sipadi_process_uptime_seconds gauge",
    `sipadi_process_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
    "# HELP sipadi_http_requests_total HTTP requests processed.",
    "# TYPE sipadi_http_requests_total counter"
  ];

  for (const [key, value] of httpMetrics) {
    const labels = JSON.parse(key);
    const rendered = labelString(["method", "route", "status_class"], labels);
    lines.push(`sipadi_http_requests_total{${rendered}} ${value.count}`);
    lines.push(`sipadi_http_request_duration_seconds_sum{${rendered}} ${value.duration.toFixed(6)}`);
    lines.push(`sipadi_http_request_duration_seconds_count{${rendered}} ${value.count}`);
  }

  lines.push("# HELP sipadi_security_events_total Security events emitted.");
  lines.push("# TYPE sipadi_security_events_total counter");
  for (const [key, count] of securityMetrics) {
    const labels = JSON.parse(key);
    lines.push(`sipadi_security_events_total{${labelString(["type", "severity"], labels)}} ${count}`);
  }
  return `${lines.join("\n")}\n`;
}

export const metricsTestUtils = { normalizedPath };
