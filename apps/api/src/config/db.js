import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

function databaseSslConfig() {
  if (env.databaseSslMode === "disable") return false;
  const config = { rejectUnauthorized: env.databaseSslMode === "verify-full" };
  if (env.databaseSslCaBase64) {
    config.ca = Buffer.from(env.databaseSslCaBase64, "base64").toString("utf8");
  }
  return config;
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: databaseSslConfig(),
  max: env.databasePoolMax,
  idleTimeoutMillis: env.databaseIdleTimeoutMs,
  connectionTimeoutMillis: env.databaseConnectionTimeoutMs,
  statement_timeout: env.databaseStatementTimeoutMs,
  query_timeout: env.databaseQueryTimeoutMs,
  application_name: "sipadi-api",
  keepAlive: true
});

pool.on("error", (error) => {
  console.error(`DATABASE_POOL_ERROR ${String(error.code || error.message || "unknown").slice(0, 120)}`);
});

export function query(text, params) {
  return pool.query(text, params);
}

export function getClient() {
  return pool.connect();
}
