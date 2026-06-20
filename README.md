# LMS Academy WebApp

A React-based Learning Management System (LMS) for students, trainers, and administrators. This guide covers local development, server setup, production builds, backend integration, and deployment with **PM2** and **Nginx**.

## About the Project

| Role | Capabilities |
|------|-------------|
| **Students** | Enroll in courses, view materials, access dashboards |
| **Trainers** | Manage courses, run live sessions, upload notes |
| **Admins** | Manage users, courses, and live sessions |

## Tech Stack

| Layer | Technology |
|-------|-------------|
| UI | React 19, React Router DOM 7, Tailwind CSS 4, Framer Motion |
| HTTP | Axios (JWT auth interceptors) |
| Build | Vite 7 |
| Process manager | PM2 |
| Reverse proxy | Nginx (required for API/media in production) |
| Backend | Django REST API (port `8000`) |

## Architecture

This is a **Single Page Application (SPA)**. The frontend never embeds a backend URL in production — it calls relative paths (`/api`, `/media`). A reverse proxy forwards those requests to the Django backend.

```
Browser
   │
   ▼
Nginx (port 80/443)
   ├── /          → PM2 static server (port 3000, serves dist/)
   ├── /api/*     → Django backend (port 8000)
   └── /media/*   → Django backend (port 8000)
```

**Development** uses the Vite dev proxy instead of Nginx:

```
Browser → Vite dev server (5173) → proxy /api, /media → Backend (8000)
```

---

## Prerequisites

### Local development
- Node.js **18+** (LTS recommended)
- npm **9+**
- Git

### Production server (Ubuntu/Debian recommended)
- Node.js **18+** and npm
- Git
- **PM2** (`npm install -g pm2`)
- **Nginx** (`sudo apt install nginx`)
- Django backend running and reachable on port **8000**
- Open firewall ports: **80** (HTTP), **443** (HTTPS, optional), **8000** (backend, internal)

Verify on the server:

```bash
node --version    # v18+
npm --version
git --version
nginx -v
pm2 --version
curl http://localhost:8000/api/   # backend must respond
```

---

## 1. Clone and Install on the Server

```bash
# SSH into your server
ssh -i your-key.pem ubuntu@YOUR_SERVER_IP

# Clone the repository
cd ~
git clone https://github.com/YOUR_ORG/lms-academey-webapp.git
cd lms-academey-webapp

# Install dependencies (~2–3 minutes)
npm install
```

Expected project layout:

```
lms-academey-webapp/
├── src/                  # React source code
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route pages (admin, trainer, student)
│   ├── context/          # AuthContext (JWT session)
│   ├── services/api.js   # Axios client — all API calls
│   └── utils/
├── dist/                 # Production build output (created by npm run build)
├── ecosystem.config.cjs  # PM2 process configuration
├── vite.config.js        # Vite + dev proxy settings
├── package.json
└── .env                  # Environment variables (you create this)
```

---

## 2. Environment Variables (.env)

Vite loads variables prefixed with `VITE_` from `.env` files. **Never commit real `.env` files** — they are gitignored.

### Create your .env files

```bash
# Copy the template
cp .env.example .env

# For production builds (optional, same values)
cp .env.example .env.production
```

### .env file reference

Create `.env` in the project root:

```env
# Backend URL — used ONLY by the Vite dev server proxy (npm run dev)
VITE_PROXY_TARGET=http://43.205.127.39:8000

# Port for PM2 static server (ecosystem.config.cjs)
PORT=3000
```

| Variable | Used when | Purpose |
|----------|-----------|---------|
| `VITE_PROXY_TARGET` | `npm run dev` | Tells Vite where to proxy `/api` and `/media` requests |
| `PORT` | PM2 / `serve` | Port the frontend process listens on (default `3000`) |

### Environment file loading order (Vite)

| File | When loaded |
|------|-------------|
| `.env` | All modes |
| `.env.local` | All modes, gitignored, highest priority locally |
| `.env.development` | `npm run dev` |
| `.env.production` | `npm run build` |

### Examples for different backends

**Backend on the same server:**
```env
VITE_PROXY_TARGET=http://127.0.0.1:8000
```

**Backend on a remote server (default in this project):**
```env
VITE_PROXY_TARGET=http://43.205.127.39:8000
```

**One-off dev command without editing .env:**
```bash
VITE_PROXY_TARGET=http://localhost:8000 npm run dev
```

> **Important:** `VITE_PROXY_TARGET` affects **development only**. The production build always uses relative `/api` and `/media` paths. You must configure Nginx to proxy those paths to your backend (see Section 5).

---

## 3. Connect to the Backend

### How the frontend talks to the backend

All API logic lives in `src/services/api.js`:

```javascript
const API_BASE = '/api';   // relative path — proxied in dev and production
```

| Path | Purpose |
|------|---------|
| `/api/*` | REST API (login, courses, users, live sessions, etc.) |
| `/media/*` | Course images and uploaded files |

### Dev proxy (vite.config.js)

During `npm run dev`, Vite forwards requests automatically:

```javascript
proxy: {
  '/api':   { target: process.env.VITE_PROXY_TARGET || 'http://43.205.127.39:8000' },
  '/media': { target: process.env.VITE_PROXY_TARGET || 'http://43.205.127.39:8000' },
}
```

### Authentication flow

1. User submits email/password on `/login`
2. Frontend calls `POST /api/users/login/`
3. Backend returns `{ access, refresh, user }` (JWT tokens)
4. Tokens stored in `localStorage` (`accessToken`, `refreshToken`, `user`)
5. Every subsequent request includes `Authorization: Bearer <accessToken>`
6. On `401`, the app clears storage and redirects to `/login`

### Verify backend connectivity

```bash
# On the server — backend must be running
curl http://localhost:8000/api/

# Test login endpoint (replace credentials)
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

### Backend requirements

- Django (or compatible) REST API on port **8000**
- Endpoints under `/api/` (e.g. `users/login/`, `courses/`, `live-sessions/`)
- Media files served at `/media/`
- CORS configured if you bypass Nginx and call the backend URL directly from the browser

---

## 4. Run Locally (Development)

```bash
# 1. Create .env (see Section 2)
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Ensure backend is running on port 8000

# 4. Start dev server
npm run dev
```

Open **http://localhost:5173** — changes hot-reload automatically.

---

## 5. Build for Production

```bash
cd ~/lms-academey-webapp

# Install/update dependencies
npm install

# Create production bundle
npm run build
```

Output lands in `dist/`:

```
dist/
├── index.html
├── assets/
│   ├── index-<hash>.js
│   ├── index-<hash>.css
│   └── vendor-<hash>.js
└── ...
```

Verify the build:

```bash
ls -lh dist/
du -sh dist/          # ~500 KB total
```

Optional local preview (no API proxy — login will fail without Nginx):

```bash
npm run preview
```

---

## 6. Deploy with PM2

PM2 keeps the frontend process alive, restarts on crash, and starts on server reboot.

### Step 1 — Install PM2 and serve

```bash
sudo npm install -g pm2 serve
```

### Step 2 — Build the app

```bash
cd ~/lms-academey-webapp
npm install
npm run build
```

### Step 3 — Start with PM2

The project includes `ecosystem.config.cjs`:

```bash
# Start the frontend
pm2 start ecosystem.config.cjs

# Verify it is running
pm2 status
pm2 logs lms-frontend

# Test locally on the server
curl http://localhost:3000/
```

### PM2 commands reference

```bash
pm2 start ecosystem.config.cjs     # Start app
pm2 restart lms-frontend          # Restart after rebuild
pm2 stop lms-frontend             # Stop app
pm2 delete lms-frontend           # Remove from PM2
pm2 logs lms-frontend             # View logs
pm2 monit                         # Live dashboard
pm2 save                          # Save process list
pm2 startup                       # Enable auto-start on reboot (run the command it prints)
```

### Step 4 — Configure Nginx (required)

PM2 serves static files only. Nginx must proxy `/api` and `/media` to the backend and forward all other traffic to PM2.

```bash
sudo nano /etc/nginx/sites-available/lms-frontend
```

Paste (replace `YOUR_SERVER_IP` and paths as needed):

```nginx
upstream lms_frontend {
    server 127.0.0.1:3000;
}

upstream lms_backend {
    server 127.0.0.1:8000;          # or your remote backend IP:8000
}

server {
    listen 80;
    server_name YOUR_SERVER_IP;     # or your domain, e.g. lms.example.com

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API → Django backend
    location /api/ {
        proxy_pass http://lms_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media files → Django backend
    location /media/ {
        proxy_pass http://lms_backend/media/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static assets with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        proxy_pass http://lms_frontend;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA — all routes fall back to index.html
    location / {
        proxy_pass http://lms_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/lms-frontend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default    # remove default site if conflicting
sudo nginx -t                                # test config
sudo systemctl reload nginx
```

### Step 5 — Verify deployment

```bash
# Frontend
curl -I http://localhost/

# API through Nginx
curl http://localhost/api/

# PM2 health
pm2 status
```

In a browser, open **http://YOUR_SERVER_IP/** and test login. Check DevTools → Network for `POST /api/users/login/` returning **200**.

---

## 7. Full Server Setup Checklist

Use this sequence for a fresh Ubuntu server:

```bash
# 1. System packages
sudo apt update
sudo apt install -y nginx git curl

# 2. Node.js 18 LTS (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. PM2
sudo npm install -g pm2 serve

# 4. Clone and configure app
cd ~
git clone https://github.com/YOUR_ORG/lms-academey-webapp.git
cd lms-academey-webapp
cp .env.example .env
nano .env    # set VITE_PROXY_TARGET to your backend URL

# 5. Build and start
npm install
npm run build
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup    # follow the printed command

# 6. Configure Nginx (see Section 6, Step 4)
sudo nginx -t && sudo systemctl reload nginx

# 7. Ensure Django backend is running on port 8000
curl http://localhost:8000/api/
```

---

## 8. Redeploy After Code Changes

```bash
cd ~/lms-academey-webapp

git pull origin main
npm install          # only needed if package.json changed
npm run build
pm2 restart lms-frontend
```

One-liner redeploy script (`~/redeploy.sh`):

```bash
#!/bin/bash
set -e
cd ~/lms-academey-webapp
git pull origin main
npm install
npm run build
pm2 restart lms-frontend
echo "Deployed — visit http://$(curl -s ifconfig.me)/"
```

```bash
chmod +x ~/redeploy.sh
~/redeploy.sh
```

---

## 9. Alternative: Nginx Static Files (No PM2)

If you prefer Nginx to serve `dist/` directly without PM2:

```bash
npm run build
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo systemctl reload nginx
```

Nginx `root` directive:

```nginx
root /home/ubuntu/lms-academey-webapp/dist;
location / { try_files $uri $uri/ /index.html; }
```

Keep the `/api/` and `/media/` proxy blocks from Section 6.

---

## 10. Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 5173 with API proxy |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview build locally (port 4173, no API proxy) |
| `npm run lint` | ESLint check |

---

## 11. API Endpoints Used by the Frontend

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users/login/` | Login |
| POST | `/api/users/register/` | Register user |
| GET | `/api/users/` | List users |
| GET | `/api/courses/` | List courses |
| POST | `/api/courses/` | Create course |
| GET | `/api/modules/` | List modules |
| GET | `/api/live-sessions/` | List live sessions |
| POST | `/api/students/enrollments/` | Enroll student |
| POST | `/api/upload-recording/` | Upload session recording |

Full implementation: `src/services/api.js`

---

## 12. Troubleshooting

### Frontend

| Problem | Cause | Fix |
|---------|-------|-----|
| Blank page | Build missing or PM2 down | `npm run build && pm2 restart lms-frontend` |
| 404 on `/dashboard` | SPA routing not configured | Add `try_files` or proxy all routes to PM2 |
| CSS/JS 404 | Stale build | Rebuild and restart PM2 |
| Redirect loop to `/login` | Expired JWT | Clear browser localStorage, log in again |

### API / Backend

| Problem | Cause | Fix |
|---------|-------|-----|
| `502 Bad Gateway` on `/api/` | Backend not running | Start Django on port 8000 |
| `401 Unauthorized` | Invalid credentials or expired token | Re-login; check backend JWT settings |
| CORS errors in dev | Wrong proxy target | Set `VITE_PROXY_TARGET` in `.env` |
| Network error on login | Nginx not proxying `/api` | Add `/api/` location block (Section 6) |

### PM2

| Problem | Cause | Fix |
|---------|-------|-----|
| App not starting | `dist/` missing | Run `npm run build` first |
| Port 3000 in use | Another process on 3000 | Change `PORT` in ecosystem.config.cjs |
| Not surviving reboot | Startup not saved | Run `pm2 save && pm2 startup` |

### Useful debug commands

```bash
pm2 logs lms-frontend --lines 50
sudo tail -50 /var/log/nginx/error.log
curl -v http://localhost/api/
curl -v http://localhost:8000/api/
sudo netstat -tlnp | grep -E ':80|:3000|:8000'
```

---

## 13. Project Structure

```
src/
├── components/
│   ├── login/              # Login form
│   ├── navigationbar/      # Top navigation
│   ├── coursecard/         # Course card component
│   └── ProtectedRoute.jsx  # Role-based route guard
├── pages/
│   ├── loginpage/          # Login page
│   ├── dashboard.jsx       # Student dashboard
│   ├── courses.jsx         # Course listing
│   ├── admindashboard/     # Admin pages
│   └── trainerdashboard/   # Trainer pages
├── context/
│   └── AuthContext.jsx     # Auth state + JWT session
├── services/
│   └── api.js              # Axios client and API functions
├── data/                   # Static/mock data
└── utils/
    └── sessionUtils.js
```

---

## 14. Vercel Deployment (Optional)

The project includes `vercel.json` for Vercel hosting. Vercel rewrites `/api` and `/media` to the backend — same pattern as Nginx:

```json
{
  "rewrites": [
    { "source": "/api/:path*",   "destination": "http://43.205.127.39:8000/api/:path*" },
    { "source": "/media/:path*", "destination": "http://43.205.127.39:8000/media/:path*" }
  ]
}
```

Update the destination URL to your backend before deploying.

---

## License

[Add your license information here]
