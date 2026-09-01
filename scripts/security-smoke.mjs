const target = String(process.env.TARGET_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const allowed = process.env.ALLOW_SECURITY_TESTS === "true";

if (!allowed) {
  throw new Error("Set ALLOW_SECURITY_TESTS=true hanya setelah target dan izin pengujian dikonfirmasi");
}

const findings = [];
const checks = [];

async function request(path, options = {}) {
  const response = await fetch(`${target}${path}`, { redirect: "manual", ...options });
  return response;
}

const health = await request("/api/health");
checks.push({ name: "health", status: health.status, pass: health.ok });

const loginPage = await request("/login");
for (const [header, expected] of [
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", null],
  ["content-security-policy", null]
]) {
  const value = loginPage.headers.get(header);
  const pass = expected ? value?.toLowerCase().includes(expected) : Boolean(value);
  checks.push({ name: `header:${header}`, pass, value });
  if (!pass) findings.push(`Header ${header} belum terpasang pada /login`);
}

const invalidLogin = await request("/api/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ identifier: "security-smoke-nonexistent", password: "InvalidOnlyForSmoke1!" })
});
checks.push({ name: "invalid-login-rejected", status: invalidLogin.status, pass: invalidLogin.status === 401 || invalidLogin.status === 429 });

const unauthenticated = await request("/api/security/summary");
checks.push({ name: "protected-security-api", status: unauthenticated.status, pass: unauthenticated.status === 401 });

if (checks.some((check) => !check.pass)) process.exitCode = 1;
console.log(JSON.stringify({ target, checks, findings }, null, 2));
