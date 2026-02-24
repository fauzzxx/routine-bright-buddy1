# Deploying Routine Bright Buddy to Vercel

## Single-project deployment (frontend + backend)

This repo is set up to deploy as **one Vercel project**:

- **Frontend:** Vite + React (build output in `dist`).
- **Backend:** FastAPI running as a Vercel Serverless Function under `/api/*` (Mangum adapter in `api/index.py`).

You do **not** need to deploy frontend and backend separately. Deploy once from the repo root.

**Optional:** To use pre-recorded step videos, copy your MP4 files from `server/recordings/` into `api/recordings/` (or add them there). The backend will use them when the prompt matches.

---

## Deploy to Vercel

### 1. Push your code to GitHub

If you haven’t already:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Import the project in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New…** → **Project**.
3. Import your GitHub repo.
4. **Root Directory:** leave as `.` (repo root) if `package.json` and `vite.config.ts` are in the root. If your repo has a subfolder (e.g. `routine-bright-buddy-1-main/`) that contains the frontend, set **Root Directory** to that folder.
5. **Framework Preset:** Vercel usually detects **Vite**; if not, choose **Vite**.
6. **Build Command:** `npm run build` (default).
7. **Output Directory:** `dist` (Vite default).
8. **Install Command:** `npm install` (default).

### 3. Set environment variables (Vercel dashboard)

In the project → **Settings** → **Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | From Supabase → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key | From Supabase → Settings → API |
| `VITE_DEMO_MODE` | `false` | Use `true` only for demo-without-Supabase |
| `VITE_BACKEND_URL` | (optional) Your backend URL | Only if you deploy the Python backend (e.g. `https://your-app.railway.app`) |

For **Supabase** to work in production you must set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` and set `VITE_DEMO_MODE` to `false` (or leave it unset).

### 4. Deploy

Click **Deploy**. Vercel will run `npm run build` and serve the `dist` folder. The `vercel.json` in this repo configures SPA routing so routes like `/caregiver`, `/child`, `/create-routine` work.

### 5. After deploy

- Your site will be at `https://your-project.vercel.app`.
- For custom domain: **Settings** → **Domains** and add your domain.

---

## Part 2: (Optional) Deploy the Python backend

Use this only if you need the video API (e.g. serving recordings or `/generate-animation`).

### Option A: Railway

1. Go to [railway.app](https://railway.app), sign in with GitHub.
2. **New Project** → **Deploy from GitHub repo**.
3. Select the same repo; set **Root Directory** to `server` (where `main.py` lives).
4. **Settings** → add a start command, e.g. `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Add env vars if needed: `BACKEND_CORS_ORIGIN` (your Vercel URL), `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, etc.
6. Deploy; copy the public URL (e.g. `https://xxx.railway.app`).
7. In **Vercel** (frontend), set `VITE_BACKEND_URL` to that URL and redeploy.

### Option B: Render

1. Go to [render.com](https://render.com), connect GitHub.
2. **New** → **Web Service**; select repo, set **Root Directory** to `server`.
3. **Build:** `pip install -r requirements.txt` (if you have one) or install deps manually.
4. **Start:** `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Set env vars; after deploy, set `VITE_BACKEND_URL` in Vercel to the Render URL.

---

## Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created, root (or subfolder) and build/output correct
- [ ] `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` set in Vercel
- [ ] `VITE_DEMO_MODE` set to `false` (or unset) for production
- [ ] If using backend: backend deployed and `VITE_BACKEND_URL` set in Vercel
- [ ] Redeploy after any env change (Vercel uses env at build time for Vite)

---

## Troubleshooting

- **404 on refresh (e.g. /caregiver):** The `vercel.json` rewrites should fix this. If not, ensure **Rewrites** in Vercel point non-asset routes to `/index.html`.
- **Supabase / auth not working:** Check Supabase URL and anon key; in Supabase dashboard add your Vercel domain to **Authentication → URL Configuration → Redirect URLs**.
- **Videos or “backend” not working:** Either deploy the Python backend and set `VITE_BACKEND_URL`, or rely only on Supabase + demo (no video API).
