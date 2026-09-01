#!/usr/bin/env sh
set -eu

PROJECT_DIR="${SIPADI_PROJECT_DIR:-/opt/sipadi}"
cd "$PROJECT_DIR"

npm audit --omit=dev --audit-level=high
npm test

if command -v docker >/dev/null 2>&1; then
  docker compose -f docker-compose.security.yml config --quiet
  docker compose -f docker-compose.security.yml images
fi

if command -v freshclam >/dev/null 2>&1; then
  freshclam --version
fi
