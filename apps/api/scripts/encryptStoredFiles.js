import fs from "node:fs";
import { env } from "../src/config/env.js";
import { pool, query } from "../src/config/db.js";
import { resolveUploadPath } from "../src/middleware/upload.js";
import { decryptStoredBuffer, encryptStoredFile, isEncryptedStoredFile } from "../src/services/storedFileEncryption.js";
import { isS3StorageReference } from "../src/services/fileStorage.js";

const apply = process.argv.includes("--apply");
const rotate = process.argv.includes("--rotate");

if (!env.fileEncryptionKey) {
  console.error("FILE_ENCRYPTION_KEY wajib diisi sebelum migrasi berkas.");
  process.exitCode = 2;
} else {
  try {
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

    let encrypted = 0;
    let alreadyEncrypted = 0;
    let missing = 0;
    let remote = 0;
    for (const row of result.rows) {
      if (isS3StorageReference(row.file_path)) {
        remote += 1;
        continue;
      }
      const filePath = resolveUploadPath(row.file_path);
      if (!fs.existsSync(filePath)) {
        missing += 1;
        console.warn(`MISSING ${row.file_path}`);
        continue;
      }
      const header = await fs.promises.readFile(filePath);
      const currentEncrypted = isEncryptedStoredFile(header);
      if (currentEncrypted && !rotate) {
        decryptStoredBuffer(header, { allowPlaintext: false });
        alreadyEncrypted += 1;
        continue;
      }
      if (apply) await encryptStoredFile(filePath, { force: rotate });
      encrypted += 1;
      console.log(`${apply ? "ENCRYPTED" : "WOULD_ENCRYPT"} ${row.file_path}`);
    }

    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", rotate, encrypted, alreadyEncrypted, remote, missing }));
    if (!apply && encrypted > 0) {
      console.log("Jalankan ulang dengan --apply setelah backup dan verifikasi hasil dry-run.");
    }
  } catch (error) {
    console.error(`Migrasi enkripsi gagal: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
