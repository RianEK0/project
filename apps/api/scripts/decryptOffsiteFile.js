import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../src/config/env.js";
import { decryptEnvelope, selectEncryptionKey } from "../src/services/cryptoEnvelope.js";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

const inputPath = path.resolve(argument("--input") || "");
const outputPath = path.resolve(argument("--output") || "");
if (!argument("--input") || !argument("--output")) {
  throw new Error("Gunakan --input <file.sipadi> --output <tujuan>; file tujuan tidak boleh sudah ada");
}

const container = JSON.parse(await fs.readFile(inputPath, "utf8"));
if (container?.app !== "SIPADI" || container?.format !== "encrypted-file" || !container.source) {
  throw new Error("Format file offsite SIPADI tidak valid");
}

const key = selectEncryptionKey(container.encryption, {
  currentKey: env.backupEncryptionKey,
  currentKeyId: env.backupEncryptionKeyId,
  previousKeys: env.backupPreviousEncryptionKeys,
  name: "BACKUP_ENCRYPTION_KEY"
});
const plaintext = decryptEnvelope(container.encryption, {
  key,
  aad: `sipadi:offsite-file:v1:${container.source}`
});

await fs.writeFile(outputPath, plaintext, { flag: "wx", mode: 0o600 });
console.log(JSON.stringify({ status: "ok", source: container.source, output: outputPath, bytes: plaintext.length }));
