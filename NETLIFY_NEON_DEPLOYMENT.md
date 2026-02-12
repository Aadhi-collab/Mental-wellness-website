# 🚀 Deploying to Netlify with Neon Database

Complete guide for deploying the Wellness Tracker to Netlify and connecting to Neon PostgreSQL database.

---

## 📋 Prerequisites

Before starting, you need:
- ✅ GitHub account (for code hosting)
- ✅ Netlify account (free tier available)
- ✅ Neon account (free tier available)
- ✅ Git installed locally

---

## 🔧 Step 1: Set Up Neon Database

### Create Neon Project

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Click **Create project**
4. Name your project: `wellness-tracker` (or any name)
5. Choose region closest to you
6. Click **Create project**

### Get Connection String

1. In Neon dashboard, go to **Connection string** section
2. Select **Connection pooling** (recommended for serverless)
3. Copy the full connection string:
   ```
   postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require
   ```
4. Keep this secure ⚠️ (contains password)

### Create Database Tables

If you need to store user data, run these SQL commands in Neon:

```sql
-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create check-ins table
CREATE TABLE checkins (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    mood_score INT,
    sleep_hours FLOAT,
    stress_level INT,
    journal_entry TEXT,
    activities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_checkins_user_id ON checkins(user_id);
CREATE INDEX idx_checkins_created_at ON checkins(created_at);
```

---

## 🐙 Step 2: Push Code to GitHub

### Initialize Git Repository

```bash
cd your-project-folder
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
git add .
git commit -m "Initial commit: Wellness Tracker with Neon support"
```

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `wellness-tracker` (or your preference)
3. DON'T add README, .gitignore, or license (we have them)
4. Click **Create repository**

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/wellness-tracker.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 3: Deploy to Netlify

### Connect Repository

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** as provider
4. Authenticate and select your repository
5. Configure build settings:
   - **Base directory**: Leave empty (root)
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (current directory)

### Add Environment Variables

**CRITICAL:** Before deploying, add environment variables.

1. **Before clicking Deploy**, click **Advanced** → **New variable**
2. Add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `DEPLOYMENT_ENV` | `netlify` |
| `USE_NEON_DATABASE` | `true` |
| `ENABLE_CLOUD_SYNC` | `true` |

**Example DATABASE_URL:**
```
postgresql://user:password@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require
```

3. Click **Deploy site**

---

## ✅ Verify After Deployment

1. **Check deployment status** in Netlify dashboard
2. **Visit your site URL** (looks like: `https://your-site-name.netlify.app`)
3. **Test login/registration** to ensure database connection works
4. **Check browser console** (F12) for errors

---

## 🔄 Step 4: Update Environment Variables Later

If you need to add or change environment variables after deployment:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add/update key-value pairs
4. Click **Deploy changes** (or push new code to redeploy)

---

## 📊 How It Works

```
┌─────────────────┐
│  Your Browser   │
│ (Netlify Site)  │
└────────┬────────┘
         │
         │ HTTPS
         ↓
┌─────────────────┐
│    Netlify      │
│  (Frontend)     │
└────────┬────────┘
         │
         │ Environment Variables
         │ (DATABASE_URL, etc.)
         │
         ↓
┌─────────────────────────────────────┐
│         Neon Database               │
│    (PostgreSQL in the Cloud)        │
│  ep-xxxxx.us-east-1.neon.tech       │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or "Cannot connect to database"

**Solution:**
- ✅ Verify `DATABASE_URL` is correct (copy from Neon dashboard again)
- ✅ Make sure password in URL has special characters escaped (@ → %40, etc.)
- ✅ Check Neon project is active (not suspended)
- ✅ Verify network access in Neon: **Project Settings** → **IP Whitelist** → Allow all

### Issue: Blank page after deployment

**Solution:**
- ✅ Check browser console (F12) for JavaScript errors
- ✅ Verify all file paths are relative (`./app.js` not `/app.js`)
- ✅ Clear cache: Hard refresh Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: Environment variables not loading

**Solution:**
- ✅ Check variables are set in **Site settings** → **Environment**
- ✅ Push a new commit to trigger redeploy (variables update on new deploy)
- ✅ Wait 2-3 minutes after setting variables before testing

### Issue: Database queries are slow

**Solution:**
- ✅ Use Connection Pooling instead of Direct Connection
- ✅ Add database indexes (`CREATE INDEX` queries from Step 1)
- ✅ Monitor with Neon dashboard

---

## 🔐 Security Best Practices

⚠️ **REMEMBER:**
- Never commit `.env`, `.env.local`, or secrets to GitHub
- Never share your `DATABASE_URL` publicly
- Use Netlify's secure environment variable storage
- Enable Neon's IP whitelist in production
- Rotate passwords regularly

---

## 📝 Files Reference

- **`.env.neon.example`** - Example environment variables for Neon
- **`netlify.toml`** - Netlify configuration
- **`_redirects`** - URL routing rules
- **`.gitignore`** - Prevents committing secrets

---

## 🎉 Next Steps After Deployment

1. **Set up custom domain:**
   - Netlify Dashboard → Site settings → Domain management
   - Add your own domain (yoursite.com)

2. **Enable analytics:**
   - Netlify Dashboard → Analytics

3. **Monitor your database:**
   - Neon Console → Monitoring tab

4. **Set up automatic backups:**
   - Neon on free tier: limited backups
   - Neon Pro: daily automatic backups

---

## 📞 Support & Resources

- **Netlify Docs:** https://docs.netlify.com
- **Neon Docs:** https://neon.tech/docs
- **Neon Support:** https://neon.tech/support
- **Netlify Support:** https://support.netlify.com

---

**Happy deploying! 🚀**
