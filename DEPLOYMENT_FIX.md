# 🚀 Netlify Deployment Fix Guide

## Issue
Deployment failed with error: "Build script returned non-zero exit code: 2"

## Root Cause
The build command wasn't properly installing the Netlify Functions dependencies (pg, dotenv packages).

## Solution Applied ✅

### 1. Updated netlify.toml
Changed the build command from:
```toml
command = "echo 'No build required for static site'"
```

To:
```toml
command = "cd netlify/functions && npm install && cd ../.."
```

This ensures all function dependencies are installed during the Netlify build.

### 2. Updated package.json
- Added Node version requirement: `>=16.0.0`
- Added `functions:install` script
- Improved build script description

### 3. Created .nvmrc
Fixed Node version to `18.17.0` for consistency.

### 4. Enhanced db.js
Added validation for the `DATABASE_URL` environment variable with helpful error messages.

---

## ✅ What to Do Now

### Step 1: Verify Environment Variables in Netlify
1. Go to Netlify Dashboard
2. Select your site
3. Go to **Site Settings → Build & Deploy → Environment**
4. Ensure these variables are set:
   - `DATABASE_URL` - Your NeonDB connection string
   - `JWT_SECRET` - Your secret key

### Step 2: Commit and Push Changes
```bash
git add .
git commit -m "Fix: Netlify deployment - add proper build command for functions"
git push
```

### Step 3: Trigger Redeploy
- Go to Netlify Dashboard
- Click on the latest failed deployment
- Click **Trigger Deploy** button

OR

- Go to **Deploys**
- Click **Trigger Deploy** → **Deploy Site**

### Step 4: Monitor the Build
Watch the deploy log to ensure:
- ✅ Functions dependency installation completes
- ✅ All environment variables are loaded
- ✅ No syntax errors in functions
- ✅ Build completes successfully

---

## 📋 Pre-Deployment Checklist

Before deploying to Netlify:

```
Database Setup:
☐ NeonDB account created at neon.tech
☐ Database named "wellness_tracker" created
☐ Connection string copied (format: postgresql://...)
☐ Database tables initialized (ran db-init.js locally)

Netlify Setup:
☐ Repository connected to Netlify
☐ Netlify environment variables set:
  ☐ DATABASE_URL
  ☐ JWT_SECRET
☐ Build command configured: "cd netlify/functions && npm install && cd ../.."

Code Quality:
☐ No syntax errors in functions
☐ api-service.js loaded in index.html
☐ netlify.toml has correct configuration
☐ .nvmrc specifies correct Node version

Deployment:
☐ Changes committed and pushed to GitHub
☐ Netlify shows ready to deploy
☐ Deployment triggered manually if needed
```

---

## 🔍 How to Debug if Deploy Still Fails

### 1. Check Build Logs
- Netlify Dashboard → Deploys → Click failed deploy
- Scroll to "Building" section
- Look for specific error message

### 2. Common Issues & Fixes

| Error | Solution |
|-------|----------|
| `Cannot find module 'pg'` | npm install in functions didn't run - verify build command |
| `DATABASE_URL undefined` | Check Netlify environment variables are set |
| `EACCES permission denied` | Check file permissions, try clearing cache in deploy settings |
| `Function timeout` | Database connection issue - verify NeonDB is accessible |

### 3. Test Functions Locally
```bash
npm run dev
# Navigate to http://localhost:8888
# Open developer console to see API calls
# Check for any errors
```

### 4. Clear Netlify Cache
- Netlify Dashboard → Site Settings → Build & Deploy → Clear Cache
- Redeploy

---

## 🔗 Quick Links

- **Netlify Build Logs:** https://app.netlify.com → Sites → Your Site → Deploys
- **Environment Variables:** Site Settings → Build & Deploy → Environment
- **Function Logs:** Site Settings → Functions → View Logs
- **NeonDB Status:** https://console.neon.tech

---

## 📝 After Successful Deployment

1. **Verify Site Works**
   - Open deployed URL
   - Login with credentials (user123/password123)
   - Create a wellness entry
   - Refresh page - verify data persists

2. **Check API Functions**
   - Netlify Dashboard → Site Settings → Functions
   - Verify `auth` and `entries` functions are listed
   - Check function logs for any errors

3. **Monitor Database**
   - Log into Neon console
   - View `users` and `wellness_entries` tables
   - Verify data is being stored

4. **Set Up Alerts (Optional)**
   - Netlify: Enable deploy notifications
   - Error tracking: Set up monitoring for function failures

---

## 🎯 Success Indicators

Your deployment is successful when:

✅ Netlify shows "Deployed" status
✅ Site loads without errors
✅ Login page appears
✅ Can create wellness entries
✅ Data persists after page refresh
✅ Functions show in Netlify dashboard
✅ No errors in browser console
✅ No errors in Netlify function logs

---

## 💡 Pro Tips

1. **Always test locally first**
   ```bash
   npm run dev
   ```

2. **Check function logs in production**
   - Netlify Dashboard → Functions → View Logs
   - See actual errors from deployed functions

3. **Use .gitignore properly**
   - .env.local should NOT be committed
   - node_modules/ should NOT be committed
   - .netlify/ should NOT be committed

4. **Monitor performance**
   - Set up error tracking with Sentry
   - Monitor database query performance
   - Check function execution time limits

---

## 📞 Need Help?

1. Check deploy logs in Netlify Dashboard
2. Review NEONDB_SETUP.md for database issues
3. Run `npm run dev` to test locally
4. Check browser console for frontend errors
5. Verify all environment variables are set

---

**Last Updated:** February 12, 2026
**Status:** Deployment Fix Applied ✅
**Next:** Commit changes and redeploy
