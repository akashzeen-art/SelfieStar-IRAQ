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
| `PORT` | `3001` (8080 is used by another app on this server) |
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
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3001/api/ping
```

---

## 5. Nginx reverse proxy (HTTP + HTTPS)

**Important:** On this VPS, port **8080** runs another app (AiGameopedia). SelfiStar uses **3001**.

```bash
cd /var/www/vasnumero/selfistar
git pull origin main

# Ensure app runs on 3001
echo 'PORT=3001' >> .env   # or sed -i 's/^PORT=.*/PORT=3001/' .env
bash scripts/deploy-vps.sh

# Fix nginx (disables conflicting sites, sets HTTPS → port 3001)
sudo bash scripts/fix-nginx-domain.sh
```

Or manually:

```bash
cp deploy/nginx-selfistar.conf /etc/nginx/sites-available/selfistar
ln -sf /etc/nginx/sites-available/selfistar /etc/nginx/sites-enabled/selfistar
rm -f /etc/nginx/sites-enabled/default
# Remove any other config using aiselfiesuperstar.com (e.g. vasnumero, aigameopedia)
ls /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d aiselfiesuperstar.com -d www.aiselfiesuperstar.com
```

Verify HTTPS serves SelfiStar (not AiGameopedia):

```bash
curl -sk https://aiselfiesuperstar.com/api/ping          # {"message":"ping"}
curl -sk https://aiselfiesuperstar.com/ | grep '<title>' # <title>SelfiStar</title>
```

In [MongoDB Atlas](https://cloud.mongodb.com) → **Network Access**, add your VPS public IP (or `0.0.0.0/0` temporarily for testing).

---

## 6. MongoDB Atlas

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
| Port 3001 in use | Change `PORT` in `.env` and `ecosystem.config.cjs`, update nginx upstream |
| `sharp` install errors | Run `pnpm approve-builds` and allow `sharp`, then `pnpm install` |
| 502 Bad Gateway | `pm2 logs selfistar` — app may have crashed or wrong port |
| CORS errors | `CORS_ORIGIN` must match your public URL exactly |
| Camera not working | Site must be served over **HTTPS** |

**Logs:**

```bash
pm2 logs selfistar
tail -f /var/log/selfistar/error.log
```
