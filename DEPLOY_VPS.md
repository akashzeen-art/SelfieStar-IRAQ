# Deploy SelfiStar on a VPS

Full-stack deployment (React SPA + Express API) on your own server, e.g.:

```text
root@content:/var/www/vasnumero/selfistar#
```

Production URL: **https://aiselfiesuperstar.com** (and **https://www.aiselfiesuperstar.com**).

---

## 1. Server prerequisites

On the VPS (Ubuntu/Debian):

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs nginx git

# pnpm + PM2
npm install -g pnpm pm2

# Log directory for PM2
mkdir -p /var/log/selfistar
```

---

## 2. Get the code on the server

**Option A – Git clone (first time):**

```bash
mkdir -p /var/www/vasnumero
cd /var/www/vasnumero
git clone https://github.com/akashzeen-art/selfiestarmain.git selfistar
cd selfistar
```

**Option B – Update existing checkout:**

```bash
cd /var/www/vasnumero/selfistar
git pull origin main
```

**Option C – Upload from your Mac:**

```bash
# Run on your local machine (not on the server)
rsync -avz --exclude node_modules --exclude dist --exclude .git \
  /Users/akashsharma/Desktop/selfiestarmain/ \
  root@content:/var/www/vasnumero/selfistar/
```

---

## 3. Production environment

```bash
cd /var/www/vasnumero/selfistar
cp .env.example .env
nano .env
```

Set at minimum:

| Variable | Production value |
|----------|------------------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `FRONTEND_URL` | `https://aiselfiesuperstar.com` |
| `CORS_ORIGIN` | `https://aiselfiesuperstar.com,https://www.aiselfiesuperstar.com` |
| `MONGODB_URI` | Your MongoDB Atlas URI |
| `JWT_SECRET` | Long random string (`openssl rand -hex 32`) |
| `SIGNED_URL_SECRET` | Long random string |
| `SELFIE_ENCRYPTION_KEY` | 64 hex chars (`openssl rand -hex 32`) |
| `CLOUDINARY_*` | Your Cloudinary credentials |

Do **not** commit `.env` to git.

---

## 4. Build and start with PM2

```bash
cd /var/www/vasnumero/selfistar
chmod +x scripts/deploy-vps.sh
bash scripts/deploy-vps.sh
```

Or manually:

```bash
pnpm install --frozen-lockfile
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command so PM2 survives reboots
```

Verify locally on the server:

```bash
curl http://127.0.0.1:8080/api/health
curl http://127.0.0.1:8080/api/ping
```

---

## 5. Nginx reverse proxy

```bash
cd /var/www/vasnumero/selfistar
cp deploy/nginx-selfistar.conf /etc/nginx/sites-available/selfistar
ln -sf /etc/nginx/sites-available/selfistar /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

Edit `server_name` in the nginx file if your domain is different.

---

## 6. HTTPS (Let's Encrypt)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d aiselfiesuperstar.com -d www.aiselfiesuperstar.com
```

Certbot updates nginx for SSL and auto-renewal.

---

## 7. MongoDB Atlas

In [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access**, add your VPS public IP (or `0.0.0.0/0` temporarily for testing).

---

## 8. Redeploy after code changes

On the server:

```bash
cd /var/www/vasnumero/selfistar
git pull
bash scripts/deploy-vps.sh
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 8080 in use | Change `PORT` in `.env` and `ecosystem.config.cjs`, update nginx upstream |
| `sharp` install errors | Run `pnpm approve-builds` and allow `sharp`, then `pnpm install` |
| 502 Bad Gateway | `pm2 logs selfistar` — app may have crashed or wrong port |
| CORS errors | `CORS_ORIGIN` must match your public URL exactly |
| Camera not working | Site must be served over **HTTPS** |

**Logs:**

```bash
pm2 logs selfistar
tail -f /var/log/selfistar/error.log
```
