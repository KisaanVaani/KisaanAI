#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend"

echo "Starting KisaanAI local runner..."

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed. Please install Node.js 18+."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed."
  exit 1
fi

install_if_missing() {
  local target_dir="$1"
  local label="$2"
  if [ ! -d "$target_dir/node_modules" ]; then
    echo "Installing $label dependencies..."
    (cd "$target_dir" && npm install)
  else
    echo "$label dependencies already installed."
  fi
}

install_if_missing "$ROOT_DIR" "root"
install_if_missing "$FRONTEND_DIR" "frontend"
install_if_missing "$BACKEND_DIR" "backend"

if [ ! -f "$FRONTEND_DIR/.env.local" ]; then
  if [ -f "$FRONTEND_DIR/.env.example" ]; then
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env.local"
    echo "Created frontend/.env.local from .env.example"
    echo "Please update API keys in frontend/.env.local before full usage."
  else
    echo "Warning: frontend/.env.example not found. Skipping env file setup."
  fi
fi

echo "Preparing Prisma client and local database..."
(cd "$BACKEND_DIR" && npx prisma generate && npx prisma db push)

echo "Launching frontend dev server at http://localhost:3000 ..."
cd "$FRONTEND_DIR"
npm run dev
