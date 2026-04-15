# Quick Start Deployment Checklist

## ✅ Pre-Deployment Checklist

### Repository Setup
- [ ] All code committed to Git
- [ ] Using main/master branch
- [ ] Repository is public or Vercel has access

### Environment Variables Ready
- [ ] MongoDB Atlas connection string
- [ ] JWT Secret (use something strong like: `openssl rand -base64 32`)
- [ ] Cloudinary credentials (Cloud Name, API Key, API Secret)
- [ ] Gmail/Email account with App Password

### Code Quality
- [ ] No console.log() statements (or minimal for debugging)
- [ ] All dependencies in package.json
- [ ] No local file paths (use environment variables)

---

## 🚀 Deployment Checklist (Do These in Order)

### 1. Backend Deployment
- [ ] Create new Vercel project
- [ ] Set Root Directory to `./backend`
- [ ] Add all environment variables
- [ ] Deploy & copy backend URL
- [ ] Test: `curl https://your-backend-url/health`

### 2. Admin Dashboard Deployment
- [ ] Create new Vercel project
- [ ] Set Root Directory to `./admin`
- [ ] Set VITE_API_URL to backend URL
- [ ] Deploy

### 3. Frontend Deployment
- [ ] Create new Vercel project
- [ ] Set Root Directory to `./frontend`
- [ ] Set VITE_API_URL to backend URL
- [ ] Deploy

### 4. Student Portal Deployment
- [ ] Create new Vercel project
- [ ] Set Root Directory to `./student`
- [ ] Set VITE_API_URL to backend URL
- [ ] Deploy

---

## 🧪 Post-Deployment Testing

- [ ] Backend health check passes
- [ ] Admin login page loads
- [ ] Frontend can fetch data
- [ ] Student portal responds
- [ ] No CORS errors in console
- [ ] Image upload works
- [ ] Email notifications send

---

## 📝 Important Notes

1. **Each project deploys separately** - 4 different Vercel projects needed
2. **Frontend projects need backend URL** - update VITE_API_URL after backend deploys
3. **MongoDB IP Whitelist** - add 0.0.0.0/0 or refer to Vercel docs for IP range
4. **Email Configuration** - use App Password, not regular password for Gmail

---

## 🔗 Deployment URLs (Fill After Deployment)

| Service | URL | Status |
|---------|-----|--------|
| Backend | `https://` | ⏳ |
| Admin | `https://` | ⏳ |
| Frontend | `https://` | ⏳ |
| Student | `https://` | ⏳ |

---

## 🆘 If Something Goes Wrong

1. **Check logs:** Dashboard → Project → Deployments → Logs
2. **Verify env vars:** Project Settings → Environment Variables
3. **Test locally first:** `npm run dev` in each folder
4. **Check CORS:** Browser Console (F12) → Network tab
5. **Database status:** MongoDB Atlas → Clusters → Connect

---

## 💡 Pro Tips

- Redeploy after changing environment variables
- Use Vercel CLI for faster deployment: `vercel --prod`
- Enable Analytics in Vercel for monitoring
- Set up GitHub integration for auto-deploy on push
- Use error tracking (Sentry) for production bugs
