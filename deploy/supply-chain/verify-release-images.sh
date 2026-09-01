#!/usr/bin/env sh
set -eu

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY wajib diisi, contoh organisasi/sipadi}"
: "${API_IMAGE:?API_IMAGE wajib berupa registry/repo@sha256:digest}"
: "${WEB_IMAGE:?WEB_IMAGE wajib berupa registry/repo@sha256:digest}"

if ! command -v cosign >/dev/null 2>&1; then
  echo "cosign tidak tersedia pada release host" >&2
  exit 2
fi

case "$API_IMAGE" in
  *@sha256:*) ;;
  *) echo "API_IMAGE wajib memakai digest immutable" >&2; exit 2 ;;
esac
case "$WEB_IMAGE" in
  *@sha256:*) ;;
  *) echo "WEB_IMAGE wajib memakai digest immutable" >&2; exit 2 ;;
esac

identity="^https://github.com/${GITHUB_REPOSITORY}/.github/workflows/container-release.yml@refs/tags/v.+$"
issuer="https://token.actions.githubusercontent.com"

cosign verify \
  --certificate-oidc-issuer "$issuer" \
  --certificate-identity-regexp "$identity" \
  "$API_IMAGE" >/dev/null

cosign verify \
  --certificate-oidc-issuer "$issuer" \
  --certificate-identity-regexp "$identity" \
  "$WEB_IMAGE" >/dev/null

echo "SIGNATURE GATE: LULUS untuk API dan web pada digest immutable."
