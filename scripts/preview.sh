#!/usr/bin/env bash
# Production-local preview: build then serve on :3100.
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build && npm run start -- -p 3100
