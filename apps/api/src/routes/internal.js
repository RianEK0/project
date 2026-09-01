import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { env } from "../config/env.js";
import { query } from "../config/db.js";
import { renderMetrics } from "../services/metrics.js";
import { securityStateStatus } from "../services/securityState.js";
import { asyncHandler } from "../utils/http.js";

const router = Router();

function internalTokenGuard(req, res, next) {
  if (!env.metricsEnabled) return res.status(404).json({ message: "Endpoint tidak ditemukan" });
  const supplied = Buffer.from(String(req.get("x-metrics-token") || ""));
  const expected = Buffer.from(String(env.metricsToken || ""));
  if (!expected.length || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return res.status(404).json({ message: "Endpoint tidak ditemukan" });
  }
  return next();
}

router.use(internalTokenGuard);

router.get("/metrics", (req, res) => {
  res.type("text/plain; version=0.0.4; charset=utf-8").send(renderMetrics());
});

router.get(
  "/ready",
  asyncHandler(async (req, res) => {
    await query("SELECT 1");
    if (!securityStateStatus().ready) return res.status(503).json({ status: "unavailable" });
    res.json({ status: "ready" });
  })
);

export default router;
