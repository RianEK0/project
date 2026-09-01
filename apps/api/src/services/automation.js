import { env } from "../config/env.js";
import { query } from "../config/db.js";
import { checkAndGenerateNotifications } from "./notificationService.js";

const DAILY_NOTIFICATION_JOB = "daily_notifications";
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

function getTimeParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: env.schedulerTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour),
    minute: Number(parts.minute)
  };
}

function getDateKey(value) {
  if (!value) return null;
  return getTimeParts(new Date(value)).dateKey;
}

async function updateJobStatus(jobName, status, message) {
  await query(
    `INSERT INTO system_jobs (job_name, last_run_at, last_status, last_message, updated_at)
     VALUES ($1, NOW(), $2, $3, NOW())
     ON CONFLICT (job_name)
     DO UPDATE SET last_run_at = EXCLUDED.last_run_at,
                   last_status = EXCLUDED.last_status,
                   last_message = EXCLUDED.last_message,
                   updated_at = NOW()`,
    [jobName, status, message]
  );
}

export async function runDailyNotificationJob({ force = false } = {}) {
  const current = getTimeParts();
  const dueNow =
    current.hour > env.schedulerRunHour ||
    (current.hour === env.schedulerRunHour && current.minute >= env.schedulerRunMinute);

  if (!force && !dueNow) {
    return false;
  }

  const existing = await query(
    `SELECT last_run_at
     FROM system_jobs
     WHERE job_name = $1
     LIMIT 1`,
    [DAILY_NOTIFICATION_JOB]
  );

  const lastRunDateKey = getDateKey(existing.rows[0]?.last_run_at);
  if (!force && lastRunDateKey === current.dateKey) {
    return false;
  }

  try {
    await checkAndGenerateNotifications();
    await updateJobStatus(
      DAILY_NOTIFICATION_JOB,
      "success",
      `Reminder harian selesai dijalankan pada ${current.dateKey}.`
    );
    return true;
  } catch (error) {
    await updateJobStatus(
      DAILY_NOTIFICATION_JOB,
      "failed",
      error instanceof Error ? error.message : "Terjadi kegagalan saat menjalankan reminder harian."
    );
    throw error;
  }
}

export function startAutomationScheduler() {
  runDailyNotificationJob().catch((error) => {
    console.error("Gagal menjalankan reminder otomatis saat startup:", error);
  });

  const intervalId = setInterval(() => {
    runDailyNotificationJob().catch((error) => {
      console.error("Gagal menjalankan reminder otomatis terjadwal:", error);
    });
  }, CHECK_INTERVAL_MS);

  return () => clearInterval(intervalId);
}
