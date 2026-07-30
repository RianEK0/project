import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig, env } from './apps/api/node_modules/prisma/config.js';

const repositoryRoot = resolve(fileURLToPath(new URL('.', import.meta.url)));
const environmentFile = resolve(repositoryRoot, '.env');

function loadRootEnvironmentFile() {
  if (!existsSync(environmentFile)) {
    return;
  }

  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile(environmentFile);
    return;
  }

  const environmentLines = readFileSync(environmentFile, 'utf8').split(/\r?\n/u);

  for (const rawLine of environmentLines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const normalizedLine = line.startsWith('export ') ? line.slice(7) : line;
    const separatorIndex = normalizedLine.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    const rawValue = normalizedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^(['"])(.*)\1$/u, '$2');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadRootEnvironmentFile();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
