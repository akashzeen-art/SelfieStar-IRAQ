#!/usr/bin/env bash
# Fix nginx so aiselfiesuperstar.com serves SelfiStar (not AiGameopedia) on HTTPS.
# Run on server: cd /var/www/vasnumero/selfistar && sudo bash scripts/fix-nginx-domain.sh

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/vasnumero/selfistar}"
DOMAIN="aiselfiesuperstar.com"

log() { printf '\n==> %s\n' "$*"; }

[[ -d "$APP_DIR" ]] || { echo "Missing $APP_DIR"; exit 1; }

log "Enabled nginx sites (before):"
ls -la /etc/nginx/sites-enabled/ || true

log "Installing SelfiStar nginx config"
cp "$APP_DIR/deploy/nginx-selfistar.conf" /etc/nginx/sites-available/selfistar
ln -sf /etc/nginx/sites-available/selfistar /etc/nginx/sites-enabled/selfistar

# Remove default and common conflicting configs for this VPS
for site in default vasnumero aigameopedia gameopedia content; do
  if [[ -e "/etc/nginx/sites-enabled/$site" ]]; then
    log "Disabling conflicting site: $site"
    rm -f "/etc/nginx/sites-enabled/$site"
  fi
done

# SSL certs (creates/updates HTTPS block if needed)
if command -v certbot >/dev/null 2>&1; then
  log "Running certbot for $DOMAIN"
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --redirect \
    -m admin@"$DOMAIN" 2>/dev/null || certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
else
  log "Install certbot: apt-get install -y certbot python3-certbot-nginx"
fi

log "Testing nginx config"
nginx -t

log "Reloading nginx"
systemctl reload nginx

log "Verify (should show SelfiStar / ping JSON):"
curl -sk "https://$DOMAIN/api/ping" || true
printf '\n'
curl -sk "https://$DOMAIN/" | grep -o '<title>[^<]*</title>' || true
printf '\nDone.\n'
