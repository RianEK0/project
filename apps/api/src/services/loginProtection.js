import { env } from "../config/env.js";
import { query } from "../config/db.js";

export function accountIsLocked(user, now = Date.now()) {
  return Boolean(user?.login_locked_until && new Date(user.login_locked_until).getTime() > now);
}

export async function recordAccountLoginFailure(userId) {
  const result = await query(
    `UPDATE users
     SET failed_login_count = CASE
           WHEN last_failed_login_at IS NULL OR last_failed_login_at < NOW() - ($2 * INTERVAL '1 millisecond') THEN 1
           ELSE failed_login_count + 1
         END,
         last_failed_login_at = NOW(),
         login_locked_until = CASE
           WHEN (CASE
             WHEN last_failed_login_at IS NULL OR last_failed_login_at < NOW() - ($2 * INTERVAL '1 millisecond') THEN 1
             ELSE failed_login_count + 1
           END) >= $3
           THEN NOW() + ($4 * INTERVAL '1 millisecond')
           ELSE login_locked_until
         END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING failed_login_count, login_locked_until`,
    [userId, env.accountLockWindowMs, env.accountLockThreshold, env.accountLockDurationMs]
  );
  return result.rows[0] || null;
}

export async function resetAccountLoginFailures(userId) {
  await query(
    `UPDATE users SET failed_login_count = 0, last_failed_login_at = NULL,
                      login_locked_until = NULL, updated_at = NOW()
     WHERE id = $1 AND (failed_login_count <> 0 OR login_locked_until IS NOT NULL)`,
    [userId]
  );
}
