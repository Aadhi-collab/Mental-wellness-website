# NeonDB Integration - Quick Reference

## 🎯 What Was Setup

The application has been configured to use **NeonDB** (PostgreSQL) instead of browser localStorage for persistent data storage. All user data (mood entries, sleep logs, stress levels) is now stored in a cloud database.

## 📁 New Files Created

### Backend (Netlify Functions)
- `netlify/functions/db.js` - Database connection utility
- `netlify/functions/auth.js` - Authentication endpoints (login/register)
- `netlify/functions/entries.js` - Wellness entry CRUD operations
- `netlify/functions/package.json` - Function dependencies

### Frontend API
- `api-service.js` - Service layer for API calls with fallback to localStorage

### Configuration & Initialization
- `.env.example` - Environment variables template
- `db-init.js` - Database initialization script
- `netlify.toml` - Updated with functions configuration
- `package.json` - Root package.json with scripts
- `setup.sh` / `setup.bat` - Setup scripts

### Documentation
- `NEONDB_SETUP.md` - Comprehensive setup guide

## ⚡ Quick Start Commands

```bash
# 1. Run setup (creates .env.local and installs dependencies)
npm run setup              # macOS/Linux
npm run setup:windows      # Windows (or double-click setup.bat)

# 2. Initialize database
node db-init.js

# 3. Start development server
npm run dev
```

## 🔑 Database Credentials

**Demo User (automatically created):**
- Username: `user123`
- Password: `password123`

## 📊 Database Tables

### `users`
Stores user accounts
- `id` - Primary key
- `username` - Unique username
- `password_hash` - SHA256 hashed password
- `created_at`, `updated_at` - Timestamps

### `wellness_entries`
Stores wellness data
- `id` - Primary key
- `user_id` - Foreign key to users
- `date` - Entry date (UNIQUE per user)
- `mood` - 1-10 scale
- `sleep` - Hours slept (0-23)
- `stress` - Level 1-4
- `journal` - Text notes
- `activities` - Array of tags
- `created_at`, `updated_at` - Timestamps

## 🔌 API Endpoints

All endpoints are at `/.netlify/functions/`

### Authentication
```
POST /auth
{
  "action": "login" | "register",
  "username": "user123",
  "password": "password123"
}
```

### Wellness Entries
```
GET  /entries?user_id=1        - Get all entries
POST /entries                   - Save/update entry
DELETE /entries                 - Delete entry
```

## 📝 Environment Variables

Create `.env.local` with:
```
DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/wellness_tracker?sslmode=require
JWT_SECRET=your_secure_secret
NODE_ENV=development
```

## 🚀 Deployment

### To Netlify
1. Push code to GitHub
2. Connect repo to Netlify
3. Add environment variables in Netlify dashboard:
   - `DATABASE_URL` - Your NeonDB connection string
   - `JWT_SECRET` - Secret key
4. Deploy!

### GitHub Actions (Optional)
Add to run database migrations automatically on deploy. See NEONDB_SETUP.md for details.

## 🐛 Troubleshooting

### "Functions not found" error
Check that `netlify/functions/` directory exists with `.js` files

### "CONNECTION_TIMEOUT" when running db-init.js
- Verify `DATABASE_URL` is correct
- Check NeonDB credentials
- Ensure network connection is working

### API calls failing with 500 error
- Check function logs: `netlify functions:list`
- Verify environment variables are set
- Test locally with `npm run dev`

## 📚 Further Reading

- [NEONDB_SETUP.md](./NEONDB_SETUP.md) - Full setup guide
- [Neon Documentation](https://neon.tech/docs)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview)

## ✅ Next Steps

1. ✅ Create NeonDB account and database
2. ✅ Update `.env.local` with connection string
3. ✅ Run `node db-init.js` to create tables
4. ✅ Test with `npm run dev`
5. ✅ Deploy to Netlify

---

**Last Updated:** February 12, 2026
**Version:** 1.0.0
