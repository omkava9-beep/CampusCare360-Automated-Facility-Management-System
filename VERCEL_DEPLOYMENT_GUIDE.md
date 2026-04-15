# CampusCare Vercel Deployment Guide

## Project Overview
CampusCare is a monorepo with 4 deployable components:
- **Backend**: Node.js/Express API server (Vercel Serverless)
- **Admin**: React admin dashboard (Vercel Static)
- **Frontend**: React frontend for contractors (Vercel Static)
- **Student**: React student portal (Vercel Static)

---

## Prerequisites

1. **Vercel Account**
   - Sign up at https://vercel.com
   - Create a team (optional)

2. **Git Repository**
   - Push your project to GitHub, GitLab, or Bitbucket
   - Vercel will import directly from your repository

3. **Environment Variables**
   - MongoDB Atlas account with connection string
   - Cloudinary account for image uploads
   - Gmail or email service for notifications
   - JWT secret key

---

## Step-by-Step Deployment Instructions

### STEP 1: Prepare Your Repository

1. **Ensure all files are committed:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Verify structure:**
   - Root-level `vercel.json` exists ✓
   - Each subdirectory has its own `vercel.json` ✓
   - `.vercelignore` files are in place ✓
   - Environment example files exist ✓

---

### STEP 2: Deploy Backend API

1. **Go to Vercel Dashboard**
   - Log in at https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**
   - Select your Git repository
   - Click "Import"

3. **Configure Backend Project**
   - **Project Name:** `campuscare-backend`
   - **Framework Preset:** Node.js
   - **Root Directory:** `./backend`
   - **Build Command:** `npm install`
   - **Install Command:** (leave default)
   - **Output Directory:** (leave empty)

4. **Add Environment Variables**
   Click "Environment Variables" and add:

   ```
   NAME                          VALUE
   ─────────────────────────────────────────
   NODE_ENV                      production
   MONGO_URI                     mongodb+srv://...
   JWT_SECRET                    your_jwt_secret_key
   JWT_EXPIRY                    7d
   CLOUDINARY_CLOUD_NAME         your_cloud_name
   CLOUDINARY_API_KEY            your_api_key
   CLOUDINARY_API_SECRET         your_api_secret
   EMAIL_USER                    your_email@gmail.com
   EMAIL_PASSWORD                your_app_password
   PORT                          (leave empty - Vercel sets it)
   ```

   **Note for Gmail:** Use [App Password](https://myaccount.google.com/apppasswords), not your regular password

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - **Copy your Backend URL** (e.g., `https://campuscare-backend.vercel.app`)

---

### STEP 3: Deploy Admin Dashboard

1. **In Vercel Dashboard, click "Add New..." → "Project"**
   - Same repository
   - Click "Import"

2. **Configure Admin Project**
   - **Project Name:** `campuscare-admin`
   - **Framework Preset:** Vite
   - **Root Directory:** `./admin`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add one variable:
     ```
     NAME              VALUE
     ─────────────────────────────────────────
     VITE_API_URL      https://campuscare-backend.vercel.app
     ```
   (Use the URL from Step 2)

4. **Deploy**
   - Click "Deploy"
   - **Copy Admin URL** (e.g., `https://campuscare-admin.vercel.app`)

---

### STEP 4: Deploy Frontend

1. **In Vercel Dashboard, click "Add New..." → "Project"**
   - Same repository
   - Click "Import"

2. **Configure Frontend Project**
   - **Project Name:** `campuscare-frontend`
   - **Framework Preset:** Vite
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add one variable:
     ```
     NAME              VALUE
     ─────────────────────────────────────────
     VITE_API_URL      https://campuscare-backend.vercel.app
     ```

4. **Deploy**
   - Click "Deploy"
   - **Copy Frontend URL** (e.g., `https://campuscare-frontend.vercel.app`)

---

### STEP 5: Deploy Student Portal

1. **In Vercel Dashboard, click "Add New..." → "Project"**
   - Same repository
   - Click "Import"

2. **Configure Student Project**
   - **Project Name:** `campuscare-student`
   - **Framework Preset:** Vite
   - **Root Directory:** `./student`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add one variable:
     ```
     NAME              VALUE
     ─────────────────────────────────────────
     VITE_API_URL      https://campuscare-backend.vercel.app
     ```

4. **Deploy**
   - Click "Deploy"
   - **Copy Student URL** (e.g., `https://campuscare-student.vercel.app`)

---

## STEP 6: Post-Deployment Verification

### Test Backend Health
```bash
curl https://campuscare-backend.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "Connected",
  "environment": "production",
  "vercel": true
}
```

### Test Frontend Connectivity
1. Open https://campuscare-admin.vercel.app in browser
2. Check browser console (F12 → Console)
3. Verify no CORS errors
4. Try logging in

### Test Student Portal
1. Open https://campuscare-student.vercel.app
2. Verify API connection works

---

## Useful Vercel Commands

### Deploy via CLI (Alternative Method)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   vercel --prod
   ```

4. **Deploy Admin:**
   ```bash
   cd admin
   vercel --prod
   ```

5. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

6. **Deploy Student:**
   ```bash
   cd student
   vercel --prod
   ```

---

## Troubleshooting

### Issue: "CORS Error" in browser console
**Solution:**
- Check backend CORS configuration
- Verify `VITE_API_URL` matches backend deployment URL
- Redeploy frontend after fixing URL
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Failed to fetch" or API not responding
**Solution:**
- Check backend logs: Vercel Dashboard → Backend project → Deployments → Logs
- Verify MongoDB connection string (MONGO_URI)
- Check if database IP whitelist includes Vercel IPs

### Issue: "502 Bad Gateway"
**Solution:**
- Wait 5 minutes for Vercel cold start
- Check backend logs for errors
- Verify environment variables are set
- Check server.js exports correctly

### Issue: Database Connection Timeout
**Solution:**
- Add Vercel's IP range to MongoDB whitelist:
  - Go to MongoDB Atlas → Security → Network Access
  - Add `0.0.0.0/0` (all IPs) for development
  - Or use MongoDB Atlas auto-allow (recommended for dev)

### Issue: File Upload Fails
**Solution:**
- Cloudinary credentials must be correct
- Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
- Verify Cloudinary account has enough API credits

---

## Environment Variables Checklists

### Backend (.env.production)
- [ ] MONGO_URI
- [ ] JWT_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] EMAIL_USER
- [ ] EMAIL_PASSWORD
- [ ] NODE_ENV=production

### Admin/Frontend/Student (.env.production)
- [ ] VITE_API_URL (matches backend URL)

---

## Custom Domains (Optional)

1. **Buy Domain**
   - Use GoDaddy, Namecheap, or any registrar

2. **Add to Vercel**
   - Project Settings → Domains
   - Add domain
   - Update DNS records (Vercel provides instructions)

**Example Setup:**
- Backend: `api.yourdomain.com`
- Admin: `admin.yourdomain.com`
- Frontend: `www.yourdomain.com`
- Student: `student.yourdomain.com`

---

## Monitoring & Logs

### View Deployment Logs
1. Vercel Dashboard → Select Project
2. Click "Deployments"
3. Click latest deployment
4. View "Build Logs" or "Runtime Logs"

### Set Up Error Tracking (Optional)
- Use Sentry/Rollbar for production error monitoring
- Add webhook for Slack notifications

---

## Performance Optimization Tips

1. **Enable Caching**
   - Vercel automatically caches static builds

2. **Use CDN**
   - Vercel includes automatic CDN

3. **Optimize Database Queries**
   - Add indexes to frequently queried fields

4. **Reduce API Payload**
   - Gzip responses
   - Minimize JSON size

---

## Common Next Steps

1. **Set up CI/CD**
   - Automatic deployments on git push
   - Vercel does this by default

2. **Configure Analytics**
   - Vercel Dashboard → Analytics tab

3. **Add Custom Status Page**
   - Monitor uptime at status.yourdomain.com

4. **Set up API Rate Limiting**
   - Protect against abuse

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Node.js on Vercel:** https://vercel.com/docs/runtimes/nodejs
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Troubleshooting:** https://vercel.com/docs/platform/troubleshoot

---

## Quick Reference URLs (After Deployment)

| Service | URL |
|---------|-----|
| Backend API | https://campuscare-backend.vercel.app |
| Admin Dashboard | https://campuscare-admin.vercel.app |
| Frontend | https://campuscare-frontend.vercel.app |
| Student Portal | https://campuscare-student.vercel.app |
| Backend Health | https://campuscare-backend.vercel.app/health |

---

**Last Updated:** April 2026
