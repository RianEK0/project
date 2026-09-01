#!/usr/bin/env sh
set -eu

MODE="${1:-dry-run}"
SSH_PORT="${SSH_PORT:-}"
ADMIN_CIDR="${ADMIN_CIDR:-}"

if [ -z "$SSH_PORT" ] || [ -z "$ADMIN_CIDR" ]; then
  echo "SSH_PORT dan ADMIN_CIDR wajib diisi agar akses administrasi tidak terkunci."
  echo "Contoh: SSH_PORT=22 ADMIN_CIDR=203.0.113.10/32 sh deploy/firewall/apply-ufw.sh --apply"
  exit 2
fi

run() {
  if [ "$MODE" = "--apply" ]; then
    sudo "$@"
  else
    printf 'DRY-RUN: sudo'
    printf ' %s' "$@"
    printf '\n'
  fi
}

run ufw default deny incoming
run ufw default allow outgoing
run ufw allow from "$ADMIN_CIDR" to any port "$SSH_PORT" proto tcp comment SIPADI-SSH-ADMIN
run ufw allow 80/tcp comment SIPADI-HTTP
run ufw allow 443/tcp comment SIPADI-HTTPS
run ufw logging medium
run ufw --force enable
run ufw status verbose
