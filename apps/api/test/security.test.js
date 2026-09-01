import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createRateLimiter, detectAttackSignature } from "../src/middleware/security.js";
import { matchesFileSignature, resolveUploadPath } from "../src/middleware/upload.js";
import { passwordPolicyIssues } from "../src/services/passwordPolicy.js";
import { parseClamdResponse } from "../src/services/malwareScanner.js";
import { approvalPayloadHash } from "../src/services/criticalApprovals.js";
import { egressDecision } from "../src/services/dataEgressProtection.js";

function responseMock() {
  return {
    headers: {},
    statusCode: null,
    payload: null,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };
}

test("rate limiter menolak request setelah batas tercapai", async () => {
  const limiter = createRateLimiter({ scope: `test-${Date.now()}`, windowMs: 60000, max: 2, message: "dibatasi" });
  const req = { ip: "127.0.0.1" };

  for (let index = 0; index < 2; index += 1) {
    const continued = await new Promise((resolve, reject) => {
      limiter(req, responseMock(), (error) => error ? reject(error) : resolve(true));
    });
    assert.equal(continued, true);
  }

  const blocked = responseMock();
  await new Promise((resolve, reject) => {
    const originalJson = blocked.json.bind(blocked);
    blocked.json = (payload) => {
      originalJson(payload);
      resolve();
      return blocked;
    };
    limiter(req, blocked, (error) => error ? reject(error) : reject(new Error("request tidak boleh diteruskan")));
  });
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.payload.message, "dibatasi");
  assert.ok(blocked.headers["Retry-After"] >= 1);
});

test("password policy mensyaratkan panjang dan variasi karakter", () => {
  assert.deepEqual(passwordPolicyIssues("KataSandiAman2026"), []);
  assert.ok(passwordPolicyIssues("password123").length > 0);
});

test("signature file diperiksa berdasarkan ekstensi", () => {
  assert.equal(matchesFileSignature(".pdf", Buffer.from("%PDF-1.7")), true);
  assert.equal(matchesFileSignature(".pdf", Buffer.from("<script>")), false);
  assert.equal(matchesFileSignature(".png", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), true);
});

test("lokasi upload menolak path traversal", () => {
  assert.throws(() => resolveUploadPath("../../.env"), /Lokasi file arsip tidak valid/);
  assert.throws(() => resolveUploadPath("folder\\secret.pdf"), /Lokasi file arsip tidak valid/);
  assert.equal(path.basename(resolveUploadPath("document.pdf")), "document.pdf");
});

test("deteksi serangan mengenali probe umum tanpa memblokir URL normal", () => {
  assert.equal(detectAttackSignature("/api/archives?search=laporan"), null);
  assert.equal(detectAttackSignature("/.%2e/%2e%2e/etc/passwd"), "PATH_TRAVERSAL");
  assert.equal(detectAttackSignature("/api/items?q=1%20union%20select%20password"), "SQL_INJECTION_PROBE");
  assert.equal(detectAttackSignature("/api/items?q=%3Cscript%3Ealert(1)"), "XSS_PROBE");
});

test("respons ClamAV membedakan file bersih dan malware", () => {
  assert.deepEqual(parseClamdResponse("stream: OK\0"), {
    clean: true,
    signature: null,
    response: "stream: OK"
  });
  assert.deepEqual(parseClamdResponse("stream: Eicar-Signature FOUND\0"), {
    clean: false,
    signature: "Eicar-Signature",
    response: "stream: Eicar-Signature FOUND"
  });
  assert.throws(() => parseClamdResponse("stream: size limit exceeded ERROR\0"), /Respons ClamAV tidak valid/);
});

test("hash approval stabil terhadap urutan key dan berubah saat payload berubah", () => {
  assert.equal(
    approvalPayloadHash({ target: 7, fields: { role: "Admin", active: true } }),
    approvalPayloadHash({ fields: { active: true, role: "Admin" }, target: 7 })
  );
  assert.notEqual(approvalPayloadHash({ target: 7 }), approvalPayloadHash({ target: 8 }));
});

test("kebijakan eksfiltrasi memberi alert lalu memblokir pada ambang", () => {
  assert.deepEqual(egressDecision(18, 2, { alertThreshold: 20, blockThreshold: 40 }), {
    projected: 20,
    alert: true,
    block: false
  });
  assert.deepEqual(egressDecision(39, 1, { alertThreshold: 20, blockThreshold: 40 }), {
    projected: 40,
    alert: true,
    block: true
  });
});
