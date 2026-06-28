#!/usr/bin/env sh
# Remove all build artifacts across the monorepo.
# Run from repo root: sh scripts/clean-all.sh

set -e

echo "Cleaning build artifacts..."

find . -name "dist" -type d \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -exec rm -rf {} + 2>/dev/null || true

find . -name ".turbo" -type d \
  -not -path "*/node_modules/*" \
  -exec rm -rf {} + 2>/dev/null || true

find . -name "tsconfig.tsbuildinfo" \
  -not -path "*/node_modules/*" \
  -delete 2>/dev/null || true

echo "Done."
