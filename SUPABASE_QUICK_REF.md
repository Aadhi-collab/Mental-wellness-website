# 🚀 Supabase Integration - Quick Reference

## Installation Checklist (5 minutes)

- [ ] Create Supabase project: https://supabase.com → New Project
- [ ] Copy Project URL from Settings → API
- [ ] Copy Anon Key from Settings → API
- [ ] Paste credentials into `supabase-config.js`
- [ ] Run SQL tables from `SUPABASE_SETUP.md` 
- [ ] Test with `test-supabase.html` in browser
- [ ] Update `app.js` with changes from `SUPABASE_INTEGRATION.md`

## File Reference

| File | Purpose |
|------|---------|
| **supabase-config.js** | Supabase client initialization + database helpers |
| **supabase-auth.js** | SupabaseAuthManager + SupabaseStorageManager |
| **SUPABASE_SETUP.md** | Database setup & SQL scripts |
| **SUPABASE_INTEGRATION.md** | Code integration examples for app.js |
| **SUPABASE_SUMMARY.md** | Complete overview of setup |
| **test-supabase.html** | Test page to verify configuration (open in browser) |
| **index.html** | Updated to include Supabase scripts |

## Credentials Setup

### Get Your Credentials (2 minutes)

1. Log into https://supabase.com
2. Open your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Row with `https://`
   - **Anon (public) key** → Long string starting with `eyJ...`

### Configure (1 minute)

Edit `supabase-config.js`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## Database Setup (3 minutes)

### In Supabase Dashboard:
1. Click **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy entire SQL from `SUPABASE_SETUP.md`
4. Click **Run**
5. Tables created! ✅

### Tables Created:
- `user_profiles` - Stores user info
- `wellness_checkins` - Stores mood/sleep/stress data

## Testing (5 minutes)

### Option 1: Quick Test (Easiest)
1. Open `test-supabase.html` in browser
2. Click "Test Configuration" button
3. Follow test steps (Register → Login → Check-In)
4. Watch the results update in real-time

### Option 2: Manual Test
1. Go to Supabase Dashboard
2. Create a user: **Authentication** → **Users** tab → **Create user**
3. Go to Table Editor: **user_profiles** check the profile
4. Submit check-in data in app
5. Go to **wellness_checkins** table - see your data ✓

## Code Integration (15-30 minutes)

### Key Changes to app.js

**Replace these 3 things:**

1. **User Registration:**
```javascript
// OLD (localStorage)
const result = AuthManager.registerUser(name, email, password);

// NEW (Supabase)
const result = await SupabaseAuthManager.registerUser(name, email, password);
```

2. **User Login:**
```javascript
// OLD (localStorage)
const result = AuthManager.loginUser(email, password);

// NEW (Supabase)
const result = await SupabaseAuthManager.loginUser(email, password);
```

3. **Save Check-In:**
```javascript
// OLD (localStorage)
StorageManager.saveEntry(entry);

// NEW (Supabase)
await SupabaseStorageManager.saveEntry(entry);
```

### Mark Functions as Async
```javascript
// Find these:
LoginPageManager = { init() { ... } }
CheckInView = { loadTodayData() { ... }, handleSubmit() { ... } }

// Change to:
LoginPageManager = { async init() { ... } }
CheckInView = { async loadTodayData() { ... }, async handleSubmit() { ... } }
```

## Common Issues & Fixes

### Error: "SUPABASE_URL not configured"
```
✅ Fix: Update supabase-config.js with real credentials
```

### Error: "supabaseClient is not defined"
```
✅ Fix: Check index.html has Supabase script in <head>:
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0"></script>
<script src="supabase-config.js"></script>
<script src="supabase-auth.js"></script>
```

### Error: "Row level security (RLS) violation"
```
✅ Fix: Ensure user_id matches current user in database
- Check that user is logged in
- Check RLS policies are created (run SQL from SUPABASE_SETUP.md)
```

### Error: "User not authenticated"
```
✅ Fix: Log in before trying to save data
- Login must happen before check-in submission
```

### Data not appearing in Supabase
```
✅ Fix: Check these in order:
1. Is the table created? (Check Table Editor)
2. Is user logged in? (Check browser console)
3. Are RLS policies enabled? (Check table policies)
4. Is the data being sent? (Check browser Network tab)
```

## Function Reference

### Authentication

```javascript
// Register new user
await SupabaseAuthManager.registerUser(name, email, password)

// Login user
await SupabaseAuthManager.loginUser(email, password)

// Logout
await SupabaseAuthManager.logout()

// Get current user
await SupabaseAuthManager.getCurrentUser()

// Get current user ID
await SupabaseAuthManager.getUserId()
```

### Data Storage

```javascript
// Save check-in (mood, sleep, stress, notes)
await SupabaseStorageManager.saveEntry(entry)

// Get check-in for specific date
await SupabaseStorageManager.getEntry(date)

// Get all check-ins
await SupabaseStorageManager.getAllEntries()

// Get check-ins from last N days
await SupabaseStorageManager.getLastNDays(days)

// Calculate streak
await SupabaseStorageManager.calculateStreak()
```

## Browser Console Commands

Test in browser console (F12):

```javascript
// Check if Supabase is loaded
console.log(typeof supabaseClient)  // Should be 'object'

// Get current user
const user = await SupabaseAuthManager.getCurrentUser()
console.log(user)

// Get all check-ins
const checkins = await SupabaseStorageManager.getAllEntries()
console.log(checkins)

// Check auth status
const { data: { user } } = await supabaseClient.auth.getUser()
console.log(user)
```

## Next Steps After Integration

1. ✅ Test registration/login
2. ✅ Test data saving
3. ✅ View data in Supabase dashboard
4. 📊 Add data visualization (charts)
5. 📱 Add mobile responsiveness
6. 🔒 Enable 2FA authentication
7. 📧 Set up email verification
8. 🌍 Deploy to production

## Support

- 📖 Full integration guide: `SUPABASE_INTEGRATION.md`
- 🗄️ Setup guide: `SUPABASE_SETUP.md`
- 📋 Overview: `SUPABASE_SUMMARY.md`
- 🧪 Test page: `test-supabase.html` (open in browser)
- 🌐 Docs: https://supabase.com/docs

## Need Help?

1. **Configuration error?** → Check `SUPABASE_SETUP.md` Step 2
2. **Code not working?** → Use `test-supabase.html` to debug
3. **Data not saving?** → Check Supabase console for error messages
4. **Can't find files?** → All files in same directory as index.html

## Files in Your Project

```
app.js                      (existing - needs updates)
index.html                  (updated - includes Supabase scripts)
supabase-config.js         (NEW - Supabase credentials & helpers)
supabase-auth.js           (NEW - Auth & storage managers)
test-supabase.html         (NEW - Testing page)
SUPABASE_SETUP.md          (NEW - Database setup guide)
SUPABASE_INTEGRATION.md    (NEW - Code integration guide)
SUPABASE_SUMMARY.md        (NEW - Complete overview)
SUPABASE_QUICK_REF.md      (NEW - This file)
```
