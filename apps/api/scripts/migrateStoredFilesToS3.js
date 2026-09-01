import fs from "node:fs";
import { env } from "../src/config/env.js";
import { getClient, pool, query } from "../src/config/db.js";
import { resolveUploadPath } from "../src/middleware/upload.js";
import { initializeFileStorage, isS3StorageReference, persistEncryptedUpload } from "../src/services/fileStorage.js";
import { decryptStoredBuffer, encryptStoredFile, isEncryptedStoredFile } from "../src/services/storedFileEncryption.js";

const apply = process.argv.includes("--apply");
const columns = [
  "file_path",
  "pending_disposal_doc_path",
  "disposal_doc_path",
  "destruction_doc_path",
  "destruction_photo_path"
];

if (env.fileStorageDriver !== "s3") {
  console.error("FILE_STORAGE_DRIVER wajib s3 untuk migrasi object storage.");
  process.exitCode = 2;
} else {
  try {
    if (apply) await initializeFileStorage();
    const result = await query(
      `SELECT DISTINCT file_path
       FROM (
         SELECT file_path FROM archives
         UNION ALL SELECT pending_disposal_doc_path FROM archives
         UNION ALL SELECT disposal_doc_path FROM archives
         UNION ALL SELECT destruction_doc_path FROM archives
         UNION ALL SELECT destruction_photo_path FROM archives
       ) stored_files
       WHERE file_path IS NOT NULL AND file_path <> ''
       ORDER BY file_path`
    );

    let migrated = 0;
    let alreadyRemote = 0;
    let missing = 0;
    for (const row of result.rows) {
      const reference = row.file_path;
      if (isS3StorageReference(reference)) {
        alreadyRemote += 1;
        continue;
      }
      const localFile = resolveUploadPath(reference);
      if (!fs.existsSync(localFile)) {
        missing += 1;
        console.warn(`MISSING ${reference}`);
        continue;
      }

      const source = await fs.promises.readFile(localFile);
      if (isEncryptedStoredFile(source)) decryptStoredBuffer(source, { allowPlaintext: false });
      if (!apply) {
        migrated += 1;
        console.log(`WOULD_MIGRATE ${reference}`);
        continue;
      }

      if (!isEncryptedStoredFile(source)) await encryptStoredFile(localFile);
      const file = { path: localFile, filename: reference };
      await persistEncryptedUpload(file, { removeLocal: false });

      const client = await getClient();
      try {
        await client.query("BEGIN");
        const assignments = columns.map((column) => `${column} = CASE WHEN ${column} = $1 THEN $2 ELSE ${column} END`);
        const conditions = columns.map((column) => `${column} = $1`);
        const updated = await client.query(
          `UPDATE archives SET ${assignments.join(", ")}, updated_at = NOW()
           WHERE ${conditions.join(" OR ")}`,
          [reference, file.filename]
        );
        if (!updated.rowCount) throw new Error("Referensi database berubah selama migrasi");
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      await fs.promises.unlink(localFile);
      migrated += 1;
      console.log(`MIGRATED ${reference}`);
    }

    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", migrated, alreadyRemote, missing }));
    if (!apply && migrated > 0) console.log("Jalankan ulang dengan --apply pada maintenance window setelah backup terverifikasi.");
    if (missing > 0) process.exitCode = 1;
  } catch (error) {
    console.error(`Migrasi object storage gagal: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
