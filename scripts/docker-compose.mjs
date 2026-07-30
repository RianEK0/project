import { spawnSync } from 'node:child_process';

const composeArgs = process.argv.slice(2);

if (composeArgs.length === 0) {
  console.error('Usage: node ./scripts/docker-compose.mjs <compose-args...>');
  process.exit(1);
}

const versionCheck = spawnSync('docker', ['compose', 'version'], {
  encoding: 'utf8',
});

if (versionCheck.error?.code === 'ENOENT') {
  console.error(
    'Docker CLI tidak ditemukan. Install Docker Desktop terlebih dahulu, atau jalankan PostgreSQL dan Redis secara lokal tanpa Docker.',
  );
  process.exit(1);
}

if (versionCheck.status !== 0) {
  process.stderr.write(versionCheck.stderr ?? '');
  process.exit(versionCheck.status ?? 1);
}

const result = spawnSync('docker', ['compose', ...composeArgs], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
