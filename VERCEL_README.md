# CampusCare - Vercel Deployment Repository

This is a monorepo containing four separate applications ready for deployment on Vercel:

## 📦 Projects

| Project | Type | Location | Purpose |
|---------|------|----------|---------|
| **Backend** | Node.js/Express | `/backend` | API server, database, business logic |
| **Admin** | React/Vite | `/admin` | Admin dashboard for management |
| **Frontend** | React/Vite | `/frontend` | Contractor/User portal |
| **Student** | React/Vite | `/student` | Student portal & access |

---

## 🚀 Quick Start

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Admin (new terminal)
cd admin
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Student (new terminal)
cd student
npm install
npm run dev
```

### Production Deployment (Vercel)

See **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions.

Or use **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** for quick reference.

---

## 📋 Project Structure

```
CampusCare/
├── backend/                 # Express API server
│   ├── server.js           # Main application file
│   ├── config/             # Database & Cloudinary config
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth, upload middleware
│   ├── utils/              # Helper functions
│   ├── package.json
│   ├── vercel.json         # Vercel deployment config
│   └── .env.production     # Production env template
│
├── admin/                   # Admin Dashboard (React)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # State management
│   │   ├── config/api.js   # API helper (NEW)
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── .env.production     # Production env
│   └── .vercelignore
│
├── frontend/               # Frontend Portal (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── config/api.js   # API helper (NEW)
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── .env.production
│   └── .vercelignore
│
├── student/                # Student Portal (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   ├── config/api.js   # API helper (NEW)
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   ├── .env.production
│   └── .vercelignore
│
├── vercel.json             # Root monorepo config (NEW)
├── VERCEL_DEPLOYMENT_GUIDE.md  # Full deployment guide (NEW)
├── DEPLOYMENT_CHECKLIST.md     # Quick checklist (NEW)
└── README.md              # This file
```

---

## 🔌 API Integration

All React apps connect to the backend API via the `VITE_API_URL` environment variable.

**API Helper Usage:**

```javascript
// Import the API helper
import { getApiUrl, apiCall } from '../config/api';

// Get API URL
const baseUrl = getApiUrl();

// Make API calls
try {
  const data = await apiCall('/api/v1/user/profile', {
    method: 'GET',
  });
  console.log(data);
} catch (error) {
  console.error('API Error:', error);
}
```

---

## ⚙️ Environment Variables

### Backend (.env)
```
PORT=4000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend Apps (.env)
```
VITE_API_URL=http://localhost:4000
```

---

## 📚 Documentation Files

- **[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick reference checklist
- **[backend/TESTING_GUIDE.md](./backend/TESTING_GUIDE.md)** - API testing guide
- **[backend/COMPLETE_WORKFLOW.md](./backend/COMPLETE_WORKFLOW.md)** - Complete workflow documentation

---

## 🔐 Security Notes

1. **Never commit .env files** - Use .env.example
2. **Use strong JWT_SECRET** - Generate: `openssl rand -base64 32`
3. **MongoDB IP Whitelist** - Allow Vercel IPs
4. **HTTPS Only** - Vercel automatically provides HTTPS
5. **CORS Protected** - API allows only vercel.app domains + localhost

---

## 📞 Support

For deployment issues, see [Troubleshooting](./VERCEL_DEPLOYMENT_GUIDE.md#troubleshooting) in the deployment guide.

For API issues, check [backend/TESTING_GUIDE.md](./backend/TESTING_GUIDE.md).

---

## 🎯 Deployment Summary

| Step | Command | Time |
|------|---------|------|
| 1. Backend | Create Vercel project → `./backend` | 2-3 min |
| 2. Admin | Create Vercel project → `./admin` + VITE_API_URL | 2-3 min |
| 3. Frontend | Create Vercel project → `./frontend` + VITE_API_URL | 2-3 min |
| 4. Student | Create Vercel project → `./student` + VITE_API_URL | 2-3 min |
| **Total** | 4 separate Vercel projects | **~10-15 min** |

---

## 📦 Technology Stack

| Service | Technology | Version |
|---------|-----------|---------|
| Runtime | Node.js | 18.x |
| Backend | Express.js | Latest |
| Database | MongoDB | Atlas |
| Frontend Framework | React | 19.1.1 |
| Build Tool | Vite | 7.1.7 |
| Styling | Tailwind CSS | 4.2.1 |
| State Management | Redux Toolkit | 2.11.2 |
| Image Host | Cloudinary | Cloud |

---

## ✅ Ready for Deployment

Your project is now **deployment-ready**! Follow these guides:

1. **Start Here:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
2. **Quick Reference:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

**Status:** ✅ All configurations in place

---

Last Updated: April 2026
