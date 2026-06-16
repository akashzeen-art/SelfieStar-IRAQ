#!/usr/bin/env bash
# Deploy SelfiStar on a VPS (run on the server as root or deploy user).
# Example: cd /var/www/vasnumero/selfistar && bash scripts/deploy-vps.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/vasnumero/selfistar}"
APP_NAME="${APP_NAME:-selfistar}"
NODE_MIN_MAJOR=18

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

command -v node >/dev/null 2>&1 || die "Node.js is not installed. Install Node ${NODE_MIN_MAJOR}+ first."
command -v pnpm >/dev/null 2>&1 || die "pnpm is not installed. Run: npm install -g pnpm"
command -v pm2 >/dev/null 2>&1 || die "PM2 is not installed. Run: npm install -g pm2"

NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
[[ "$NODE_MAJOR" -ge "$NODE_MIN_MAJOR" ]] || die "Node ${NODE_MIN_MAJOR}+ required (found $(node -v))"

cd "$APP_DIR"

[[ -f .env ]] || die "Missing .env in $APP_DIR. Copy .env.example and fill production values."

log "Installing dependencies"
pnpm install --frozen-lockfile

log "Building client and server"
pnpm build

log "Ensuring log directory exists"
mkdir -p /var/log/selfistar

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  log "Restarting PM2 app: $APP_NAME"
  pm2 restart ecosystem.config.cjs --update-env
else
  log "Starting PM2 app: $APP_NAME"
  pm2 start ecosystem.config.cjs
fi

pm2 save

log "Deployment complete"
pm2 status "$APP_NAME"
printf '\nHealth check: curl -s http://127.0.0.1:3001/api/health\n'
