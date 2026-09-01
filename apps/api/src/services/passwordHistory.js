import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import { createHttpError } from "../utils/http.js";

export async function assertPasswordNotReused(client, userId, candidate, currentHash) {
  const history = await client.query(
    `SELECT password_hash FROM password_history
     WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2`,
    [userId, env.passwordHistoryCount]
  );
  const hashes = [currentHash, ...history.rows.map((row) => row.password_hash)].filter(Boolean);
  for (const hash of hashes) {
    if (await bcrypt.compare(candidate, hash)) {
      throw createHttpError(
        422,
        `Password baru tidak boleh sama dengan password saat ini atau ${env.passwordHistoryCount} password sebelumnya`
      );
    }
  }
}

export async function rememberPreviousPassword(client, userId, passwordHash) {
  if (!passwordHash) return;
  await client.query(
    "INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)",
    [userId, passwordHash]
  );
  await client.query(
    `DELETE FROM password_history
     WHERE user_id = $1 AND id NOT IN (
       SELECT id FROM password_history WHERE user_id = $1
       ORDER BY created_at DESC, id DESC LIMIT $2
     )`,
    [userId, env.passwordHistoryCount]
  );
}
