import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import archiveRoutes from "./routes/archives.js";
import dispositionRoutes from "./routes/dispositions.js";
import organizationRoutes from "./routes/organization.js";
import reportRoutes from "./routes/reports.js";
import auditLogRoutes from "./routes/auditLogs.js";
import userRoutes from "./routes/users.js";
import disposalRoutes from "./routes/disposals.js";
import notificationRoutes from "./routes/notifications.js";
import loanRoutes from "./routes/loans.js";
import systemRoutes from "./routes/system.js";
import securityRoutes from "./routes/security.js";
import internalRoutes from "./routes/internal.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { startAutomationScheduler } from "./services/automation.js";
import { initializeFileStorage } from "./services/fileStorage.js";
import { closeSecurityState, initializeSecurityState, securityStateStatus } from "./services/securityState.js";
import {
  apiRateLimit,
  attackDetectionGuard,
  blockedClientGuard,
  honeypotGuard,
  originMutationGuard,
  requestContext,
  requestLogger
} from "./middleware/security.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.trustProxy);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.frontendUrls.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"]
  })
);
app.use(requestContext);
app.use(requestLogger);
app.use(honeypotGuard);
app.use(blockedClientGuard);
app.use(attackDetectionGuard);
app.use(originMutationGuard);
app.use("/api", apiRateLimit);
app.use(express.json({ limit: env.requestBodyLimitBytes, strict: true }));
app.use(express.urlencoded({ extended: false, limit: env.requestBodyLimitBytes, parameterLimit: 100 }));

app.get("/api/health", (req, res) => {
  const securityState = securityStateStatus();
  if (!securityState.ready) return res.status(503).json({ status: "unavailable" });
  return res.json({ status: "ok" });
});

app.use("/api/internal", internalRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/archives", archiveRoutes);
app.use("/api/disposals", disposalRoutes);
app.use("/api/dispositions", dispositionRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/security", securityRoutes);

app.use(notFound);
app.use(errorHandler);

let server;
let stopAutomationScheduler = () => undefined;

async function startServer() {
  await initializeSecurityState();
  await initializeFileStorage();
  server = app.listen(env.port, () => {
    console.log(`SIPADI API berjalan di http://localhost:${env.port}`);
  });
  stopAutomationScheduler = startAutomationScheduler();
}

async function shutdown() {
  stopAutomationScheduler();
  const finish = async () => {
    await closeSecurityState();
    await pool.end();
    process.exit(0);
  };
  if (server) server.close(finish);
  else await finish();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

startServer().catch(async (error) => {
  console.error(`SIPADI_STARTUP_SECURITY_FAILURE ${String(error.code || error.message || "unknown").replace(/[\r\n]/g, "_").slice(0, 160)}`);
  await closeSecurityState();
  await pool.end().catch(() => undefined);
  process.exit(1);
});
