# Web Deployment Guide (Vercel)
## BioSprint Engine: Production Static & Serverless Cloud Deployment
**Document Identifier:** DOC-DEP-VERCEL-001  

---

## 1. Architecture Overview for Vercel

In cloud production environments:
- **Frontend SPA:** Hosted on Vercel's global Edge network with automatic HTTPS, Brotli/Gzip compression, and SPA HTML5 history rewrites.
- **Backend API & Database:** Because Vercel serverless functions are ephemeral and do not maintain long-running socket connections or persistent local disk directories for 500 MB genomic uploads, the backend should be hosted on a persistent container platform (e.g. Render, Railway, AWS ECS, or Fly.io) backed by managed PostgreSQL (e.g. Supabase, Neon, or AWS RDS).
- **API Proxy:** `vercel.json` provides rewrite rules routing `/api/(.*)` to the production backend origin, eliminating CORS overhead for clients.

---

## 2. Deployment Steps

1. **Connect Repository to Vercel:**
   - Import the GitHub repository in the Vercel Dashboard.
   - Select **Vite** as the Framework Preset.
   - Set Build Command: `npm run build`.
   - Set Output Directory: `dist`.

2. **Configure Environment Variables in Vercel:**
   - `VITE_API_URL`: URL of the persistent backend (e.g. `https://api.biosprint.research.org`).

3. **Deploy:**
   - Click **Deploy**. Vercel will bundle the React assets and distribute them globally.
