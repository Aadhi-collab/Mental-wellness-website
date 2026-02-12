# Supabase Integration Guide for Wellness Tracker

## Quick Start Checklist

- [ ] Create Supabase project
- [ ] Get API credentials (URL and Anon Key)
- [ ] Update `supabase-config.js` with credentials
- [ ] Set up database tables (see SUPABASE_SETUP.md)
- [ ] Update app.js to use Supabase functions (see below)
- [ ] Test registration and login
- [ ] Test data saving

## Integration Steps

### 1. **Update User Registration Flow** (in app.js)

**Find this code:**
```javascript
if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        const passwordConfirm = registerPasswordConfirm.value;

        if (password !== passwordConfirm) {
            alert('❌ Passwords do not match');
            return;
        }

        const result = AuthManager.registerUser(name, email, password);
        // ... rest of code
    });
}
```

**Replace with:**
```javascript
if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value;
        const passwordConfirm = registerPasswordConfirm.value;

        if (password !== passwordConfirm) {
            alert('❌ Passwords do not match');
            return;
        }

        // Use Supabase authentication
        const result = await SupabaseAuthManager.registerUser(name, email, password);
        if (result.success) {
            alert('✅ ' + result.message);
            this.switchForm('login');
        } else {
            alert('❌ ' + result.message);
        }
    });
}
```

### 2. **Update User Login Flow** (in app.js)

**Find this code:**
```javascript
if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        const result = AuthManager.loginUser(email, password);
        if (result.success) {
            this.showMainApp(result.user);
        } else {
            alert('❌ ' + result.message);
        }
    });
}
```

**Replace with:**
```javascript
if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        const result = await SupabaseAuthManager.loginUser(email, password);
        if (result.success) {
            this.showMainApp(result.user);
        } else {
            alert('❌ ' + result.message);
        }
    });
}
```

### 3. **Update Check-In Submission** (in app.js)

**Find this code in CheckInView.handleSubmit():**
```javascript
// Create and save entry
const entry = {
    date: today,
    mood,
    sleep,
    stress,
    journal,
    activities,
    timestamp: new Date().toISOString()
};

// Attempt to save
StorageManager.saveEntry(entry);
```

**Replace with:**
```javascript
// Create and save entry
const entry = {
    date: today,
    mood,
    sleep,
    stress,
    journal,
    activities,
    timestamp: new Date().toISOString()
};

// Attempt to save to Supabase
try {
    await SupabaseStorageManager.saveEntry(entry);
} catch (error) {
    throw new Error('Failed to save check-in: ' + error.message);
}
```

### 4. **Update Load Today's Data** (in app.js)

**Find this code in CheckInView.loadTodayData():**
```javascript
loadTodayData() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entry = StorageManager.getEntry(today);
        // ... rest of code
    }
}
```

**Replace with:**
```javascript
async loadTodayData() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entry = await SupabaseStorageManager.getEntry(today);
        // ... rest of code (same as before)
    }
}
```

### 5. **Update History Loading** (in app.js)

**Find uses of StorageManager.getLastNDays() and StorageManager.getAllEntries()**

**Replace with:**
```javascript
// Replace StorageManager calls with Supabase versions
const entries = await SupabaseStorageManager.getLastNDays(30);
// or
const allEntries = await SupabaseStorageManager.getAllEntries();
```

### 6. **Update Streak Calculation** (in app.js)

**Find this code:**
```javascript
const streak = StorageManager.calculateStreak();
```

**Replace with:**
```javascript
const streak = await SupabaseStorageManager.calculateStreak();
```

### 7. **Update Logout** (in app.js)

**Find the logout button handler:**
```javascript
AuthManager.logout();
```

**Replace with:**
```javascript
await SupabaseAuthManager.logout();
```

### 8. **Update PageManager.init()** (in app.js)

**Find this code:**
```javascript
const LoginPageManager = {
    init() {
        console.log('[LoginPageManager] Initializing...');
        
        // Check if user is already logged in
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser) {
            console.log('[LoginPageManager] User already logged in:', currentUser.email);
            this.showMainApp(currentUser);
            return;
        }
        // ...
    }
}
```

**Replace with:**
```javascript
const LoginPageManager = {
    async init() {
        console.log('[LoginPageManager] Initializing...');
        
        // Check if user is already logged in
        const currentUser = await SupabaseAuthManager.getCurrentUser();
        if (currentUser) {
            console.log('[LoginPageManager] User already logged in:', currentUser.email);
            this.showMainApp(currentUser);
            return;
        }
        // ...
    }
}
```

### 9. **Update App Initialization** (at the end of app.js)

**Find the initialization code:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Starting application...');
    // Check for service worker registration
    // Login page initialization
    LoginPageManager.init();
    // ...
});
```

**Replace with:**
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[App] Starting application...');
    
    // Initialize Supabase listeners for auth state
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('[Auth] Auth state changed:', event);
        // Handle auth state changes if needed
    });
    
    // Check for service worker registration
    // Login page initialization
    await LoginPageManager.init();
    // ...
});
```

## Important Notes

### Async/Await
- All Supabase functions are asynchronous (return Promises)
- Use `async/await` or `.then()` when calling them
- Mark event handlers as `async` if they call Supabase functions

### Error Handling
- Wrap Supabase calls in try/catch blocks
- Always check result.success before using result.data
- Provide meaningful error messages to users

### Testing Locally
1. Update credentials in `supabase-config.js`
2. Open developer console (F12)
3. Check for errors
4. Test registration with a new email
5. Check Supabase console to see data saved

### Migration Strategy
Option A: **Gradual Migration**
- Keep both localStorage and Supabase temporarily
- Gradually replace each function
- Test thoroughly at each step

Option B: **Big Bang Migration**
- Backup localStorage data
- Replace all auth functions
- Replace all data functions
- Test everything together

**Recommended: Option A (Gradual)**

## Sample Async Code Pattern

```javascript
// Before (localStorage - synchronous)
CheckInView = {
    handleSubmit() {
        try {
            const entry = { /* ... */ };
            StorageManager.saveEntry(entry);
            console.log('Saved');
        } catch (error) {
            console.error('Error', error);
        }
    }
};

// After (Supabase - asynchronous)
CheckInView = {
    async handleSubmit() {
        try {
            const entry = { /* ... */ };
            await SupabaseStorageManager.saveEntry(entry);
            console.log('Saved');
        } catch (error) {
            console.error('Error', error);
        }
    }
};
```

## Troubleshooting

### "supabaseClient is not defined"
- Check that supabase-config.js is loaded before app.js
- Verify Supabase script in HTML head

### "SupabaseAuthManager is not defined"
- Check that supabase-auth.js is loaded
- Verify the script tag in HTML

### "Row level security (RLS) violation"
- Data might not be associated with current user
- Check that `user_id` matches `auth.uid()` in database
- Verify RLS policies in Supabase

### Data not saving
- Check Supabase console for errors
- Verify table names match exactly
- Confirm user is authenticated (`await SupabaseAuthManager.getUserId()`)
- Check that fields match table schema

## Resources

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [SQLEditor Queries](https://supabase.com/docs/reference/sql)
