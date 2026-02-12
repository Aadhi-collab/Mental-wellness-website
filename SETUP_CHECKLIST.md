# 🚀 NeonDB Setup Checklist

Complete these steps to fully integrate NeonDB with your wellness tracker.

---

## Phase 1: Create NeonDB Account & Database ✅

- [ ] Visit [neon.tech](https://neon.tech)
- [ ] Create free account
- [ ] Create new project
- [ ] Create database named `wellness_tracker`
- [ ] Copy connection string (looks like: `postgresql://user:password@ep-xxxxx.neon.tech/wellness_tracker?sslmode=require`)

---

## Phase 2: Local Setup ✅

### Install Dependencies
- [ ] Install Node.js (v14+) from [nodejs.org](https://nodejs.org)
- [ ] Verify installation: `node --version`

### Configure Environment
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```
- [ ] Edit `.env.local` and paste NeonDB connection string as `DATABASE_URL`
- [ ] (Optional) Set `JWT_SECRET` to a random string

### Install Function Dependencies
- [ ] Run setup script:
  ```bash
  npm run setup              # macOS/Linux
  npm run setup:windows      # Windows
  ```
  OR manually:
  ```bash
  cd netlify/functions
  npm install
  cd ../..
  ```

---

## Phase 3: Initialize Database ✅

- [ ] Run initialization script:
  ```bash
  node db-init.js
  ```
- [ ] Verify output shows:
  - ✅ Users table created
  - ✅ Wellness entries table created
  - ✅ Indexes created
  - ✅ Demo user created (user123 / password123)

---

## Phase 4: Test Locally ✅

- [ ] Start development server:
  ```bash
  npm run dev
  ```
- [ ] Open browser to `http://localhost:8888`
- [ ] Login with demo credentials:
  - Username: `user123`
  - Password: `password123`
- [ ] Create a wellness entry:
  - [ ] Set mood (1-10)
  - [ ] Enter sleep hours
  - [ ] Select stress level
  - [ ] (Optional) Add journal entry
  - [ ] Click "Save Check-in"
- [ ] Verify data was saved:
  - [ ] Check History view
  - [ ] Check Analytics view
  - [ ] Refresh page - data should persist

---

## Phase 5: Deployment Setup ✅

### GitHub
- [ ] Create GitHub repository
- [ ] Push all code to GitHub
- [ ] Commit `.env.example` (NOT `.env.local`)

### Netlify
- [ ] Go to [netlify.com](https://netlify.com)
- [ ] Login/Sign up
- [ ] Create new site from Git
- [ ] Connect your GitHub repository
- [ ] In Site Settings → Build & Deploy → Environment:
  - [ ] Add `DATABASE_URL` variable with NeonDB connection string
  - [ ] Add `JWT_SECRET` variable
- [ ] Deploy site

---

## Phase 6: Verify Deployment ✅

- [ ] Visit your deployed Netlify URL
- [ ] Login with `user123` / `password123`
- [ ] Create a new wellness entry
- [ ] Refresh page - verify data persists
- [ ] Check browser developer tools for any errors
- [ ] Test dark mode toggle
- [ ] Test logout and login

---

## Phase 7: Scaling & Enhancement ✅

### User Registration (Optional)
- [ ] Uncomment registration option in login form
- [ ] Users can now create new accounts
- [ ] Each account has isolated data

### Additional Features
- [ ] Implement reminder notifications
- [ ] Add data export to CSV/PDF
- [ ] Create admin dashboard
- [ ] Add goals and progress tracking

---

## Troubleshooting Checklist

### Database Connection Issues
- [ ] Verify `DATABASE_URL` is correct
- [ ] Check NeonDB credentials
- [ ] Ensure database exists in NeonDB
- [ ] Test connection locally before deploying

### Function Not Found (500 error)
- [ ] Verify `netlify/functions/` directory exists
- [ ] Check `.js` files are in functions folder
- [ ] Verify `netlify.toml` has `functions = "netlify/functions"`
- [ ] Check Netlify function logs

### Login Fails
- [ ] Verify demo user was created: `node db-init.js`
- [ ] Check correct credentials: `user123` / `password123`
- [ ] Verify auth.js function is deployed
- [ ] Check function logs for errors

### Data Not Saving
- [ ] Verify entries.js function is deployed
- [ ] Check database connection in Netlify logs
- [ ] Verify user_id is being passed correctly
- [ ] Check NeonDB for data in wellness_entries table

---

## Quick Testing Commands

```bash
# Test database connection
node db-init.js

# Start dev server
npm run dev

# Check function logs
netlify functions:list

# View deployed functions
netlify functions:invoke auth --payload '{"action":"login","username":"user123","password":"password123"}'
```

---

## Important Files to Remember

- **`.env.local`** - Never commit! Contains credentials
- **`NEONDB_SETUP.md`** - Full technical documentation
- **`QUICK_REFERENCE.md`** - Commands and APIs
- **`netlify/functions/`** - Server code
- **`api-service.js`** - Frontend API client

---

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never share `DATABASE_URL` publicly
- [ ] Rotate `JWT_SECRET` every 3 months
- [ ] Use HTTPS-only connections
- [ ] Enable Netlify's built-in security headers
- [ ] Keep Node.js packages updated

---

## Success Criteria ✅

You'll know everything is working when:

1. ✅ Login page appears before accessing app
2. ✅ Demo user (user123/password123) can login
3. ✅ Can create wellness entries
4. ✅ Data persists after page refresh
5. ✅ Data appears in History view
6. ✅ Analytics charts display data
7. ✅ Dark mode works correctly
8. ✅ Logout works and returns to login
9. ✅ Works on Netlify deployment
10. ✅ Data is in NeonDB (you can verify in Neon dashboard)

---

## Next Phase Enhancements

- [ ] JWT token authentication
- [ ] Email verification
- [ ] Password reset functionality
- [ ] User profile management
- [ ] Data export features
- [ ] AI-powered wellness suggestions
- [ ] Social features (share, compare)
- [ ] Mobile app
- [ ] Push notifications
- [ ] Integration with health apps (Apple Health, Google Fit)

---

## Support & Resources

- 📖 **NEONDB_SETUP.md** - Complete setup guide
- 📋 **QUICK_REFERENCE.md** - Commands and API reference  
- 🆘 **GitHub Issues** - Report bugs
- 💬 **Discussions** - Ask questions
- 📧 **Email** - For urgent issues

---

**Status:** Ready to Start
**Last Updated:** February 12, 2026

Good luck! You've got this! 🎉
