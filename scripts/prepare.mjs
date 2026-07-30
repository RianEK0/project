import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptsDirectory, '..');
const gitDirectory = resolve(repositoryRoot, '.git');

if (!existsSync(gitDirectory)) {
  console.log('Skipping Husky: .git directory not found in this workspace snapshot.');
  process.exit(0);
}

const result = spawnSync('pnpm', ['exec', 'husky'], {
  cwd: repositoryRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
