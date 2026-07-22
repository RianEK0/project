#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-4173}"
LOCAL_URL="http://127.0.0.1:${PORT}"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

if ! curl -sf "${LOCAL_URL}" >/dev/null; then
  cd "${ROOT_DIR}"
  npm run start >/tmp/noctra-public-server.log 2>&1 &
  SERVER_PID=$!

  for _ in {1..20}; do
    if curl -sf "${LOCAL_URL}" >/dev/null; then
      break
    fi
    sleep 1
  done

  if ! curl -sf "${LOCAL_URL}" >/dev/null; then
    echo "Local app did not start on ${LOCAL_URL}" >&2
    exit 1
  fi
fi

echo "Public tunnel target: ${LOCAL_URL}"
exec cloudflared tunnel --url "${LOCAL_URL}" --no-autoupdate
