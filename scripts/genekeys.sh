#!/usr/bin/env bash
# Generate Android release signing keystore and optional keystore.properties.
# Usage:
#   ./scripts/genekeys.sh              # use defaults, prompts for DN
#   KEY_ALIAS=mykey KEYSTORE_PASSWORD=secret ./scripts/genekeys.sh
#   ./scripts/genekeys.sh --base64     # also print base64 for GitHub Secret
set -e

KEYS_DIR="${KEYS_DIR:-./keys}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Resolve keys dir relative to project root (parent of scripts/)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
KEYS_ABS="${PROJECT_ROOT}/${KEYS_DIR#./}"

PRINT_BASE64=false
for arg in "$@"; do
  [ "$arg" = "--base64" ] && PRINT_BASE64=true
done

mkdir -p "$KEYS_ABS"
KEYSTORE_FILE="${KEYS_ABS}/release.keystore"

# If only --base64 and keystore exists, just print base64 and exit
if [ "$PRINT_BASE64" = true ] && [ -f "$KEYSTORE_FILE" ]; then
  echo "KEYSTORE_BASE64 (copy entire line to GitHub Secret KEYSTORE_BASE64):"
  if base64 -w 0 "$KEYSTORE_FILE" 2>/dev/null; then
    echo ""
  else
    base64 < "$KEYSTORE_FILE" | tr -d '\n'
    echo ""
  fi
  exit 0
fi

KEY_ALIAS="${KEY_ALIAS:-release}"

if [ -z "$KEYSTORE_PASSWORD" ]; then
  if command -v openssl >/dev/null 2>&1; then
    KEYSTORE_PASSWORD="$(openssl rand -base64 24)"
    echo "Generated KEYSTORE_PASSWORD (save for GitHub Secret KEYSTORE_PASSWORD):"
    echo "  $KEYSTORE_PASSWORD"
  else
    echo "Set KEYSTORE_PASSWORD (and optionally KEY_PASSWORD) or install openssl to auto-generate."
    exit 1
  fi
fi
KEY_PASSWORD="${KEY_PASSWORD:-$KEYSTORE_PASSWORD}"

DNAME="${KEYSTORE_DNAME:-CN=FactoryVU, OU=Dev, O=IOCARE, L=Pune, S=MS, C=IN}"

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "$DNAME"

echo ""
echo "Keystore written: $KEYSTORE_FILE"

# keystore.properties template (storeFile relative to android/ when used in CI or after copy)
PROPS_FILE="${KEYS_ABS}/keystore.properties"
cat > "$PROPS_FILE" << EOF
storeFile=release.keystore
storePassword=$KEYSTORE_PASSWORD
keyAlias=$KEY_ALIAS
keyPassword=$KEY_PASSWORD
EOF
echo "Properties written: $PROPS_FILE"
echo ""
echo "Values for GitHub Secrets:"
echo "  KEYSTORE_ALIAS     = $KEY_ALIAS"
echo "  KEYSTORE_PASSWORD  = (value you set or generated above)"
echo "  KEY_PASSWORD       = (same as KEYSTORE_PASSWORD if not set)"
echo "  KEYSTORE_BASE64    = run: ./scripts/genekeys.sh --base64  (or see scripts/README.md)"
echo ""

if [ "$PRINT_BASE64" = true ]; then
  echo "KEYSTORE_BASE64 (copy entire line to GitHub Secret KEYSTORE_BASE64):"
  if base64 -w 0 "$KEYSTORE_FILE" 2>/dev/null; then
    echo ""
  else
    base64 < "$KEYSTORE_FILE" | tr -d '\n'
    echo ""
  fi
fi
