#!/usr/bin/env bash
# Run the Vitest suite with a specific Node from nvm on PATH (avoids "PATH=... cmd && npm"
# only applying to the first command).
#
# Usage:
#   ./scripts/test-with-nvm-node.sh
#   NVM_NODE_VERSION=v20.19.5 ./scripts/test-with-nvm-node.sh
#   OPENSPEC_NVM_PREFIX="$HOME/.nvm/versions/node/v20.19.5" ./scripts/test-with-nvm-node.sh
#
# Note: Cursor's restricted sandbox may still block Vitest fork worker teardown (EACCES on kill).
# If that happens, run the same script outside the sandbox or with full permissions.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NVM_PREFIX="${OPENSPEC_NVM_PREFIX:-$HOME/.nvm/versions/node/${NVM_NODE_VERSION:-v20.19.5}}"

if [[ ! -x "$NVM_PREFIX/bin/node" ]]; then
  echo "error: no executable node at $NVM_PREFIX/bin/node" >&2
  echo "Set OPENSPEC_NVM_PREFIX or NVM_NODE_VERSION (e.g. v20.19.5)." >&2
  exit 1
fi

export PATH="$NVM_PREFIX/bin:$PATH"
cd "$ROOT"
echo "Using node: $(command -v node) ($("$NVM_PREFIX/bin/node" --version))"
exec npm test
