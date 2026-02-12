# NeonDB Integration Guide

## Overview
This wellness tracker now uses **NeonDB** (PostgreSQL) for data storage instead of browser localStorage. Data is persisted in the cloud and accessible from any device.

## Prerequisites
- Netlify account (for hosting)
- NeonDB account (free PostgreSQL database)
- Node.js installed locally

## Setup Steps

### 1. Create a NeonDB Database

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Create a new database named `wellness_tracker`
4. Copy your connection string (looks like: `postgresql://user:password@ep-xxxxx.neon.tech/wellness_tracker?sslmode=require`)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your NeonDB connection string:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxxx.neon.tech/wellness_tracker?sslmode=require
   JWT_SECRET=your_secure_secret_key
   NODE_ENV=development
   ```

3. **For Netlify deployment**, add the same variables to your Netlify dashboard:
   - Go to Site Settings → Build & Deploy → Environment
   - Add `DATABASE_URL` and `JWT_SECRET`

### 3. Initialize the Database

Run the database initialization script to create tables:

```bash
node db-init.js
```

This will:
- Create `users` table
- Create `wellness_entries` table
- Create necessary indexes
- Insert demo user (username: `user123`, password: `password123`)

### 4. Install Dependencies

For Netlify Functions:
```bash
cd netlify/functions
npm install
cd ../..
```

### 5. Test Locally

```bash
npm run dev
# or
netlify dev
```

This starts the local Netlify Functions server and serves your site.

## API Endpoints

### Authentication
- `POST /.netlify/functions/auth`
  - `{ action: "login", username, password }`
  - `{ action: "register", username, password }`

### Wellness Entries
- `POST /.netlify/functions/entries` - Save/update entry
- `GET /.netlify/functions/entries?user_id=1` - Get all entries
- `DELETE /.netlify/functions/entries` - Delete entry

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Wellness Entries Table
```sql
CREATE TABLE wellness_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    sleep DECIMAL(4,2),
    stress INTEGER CHECK (stress >= 1 AND stress <= 4),
    journal TEXT,
    activities TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);
```

## Frontend Integration

The frontend uses `api-service.js` to communicate with the backend:

```javascript
// Login
await ApiService.login('user123', 'password123');

// Save entry
await ApiService.saveEntry({
    date: '2024-02-12',
    mood: 8,
    sleep: 7.5,
    stress: 2,
    journal: 'Had a good day',
    activities: ['exercise', 'meditation']
});

// Get all entries
const entries = await ApiService.getAllEntries();

// Get last 30 days
const recentEntries = await ApiService.getLastNDays(30);

// Calculate streak
const streak = await ApiService.calculateStreak();
```

## Deployment to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy!

The Netlify Functions will automatically be deployed along with your site.

## Offline Support

The API service includes fallback to localStorage if the API is unavailable:

```javascript
// Automatically falls back to localStorage if API is down
const entries = await ApiService.getEntriesWithFallback();
```

## Troubleshooting

### Connection Error
- Check `DATABASE_URL` environment variable is set correctly
- Ensure NeonDB IP whitelist includes your Netlify deployment IP
- Test locally with `netlify dev`

### Database Initialization Failed
- Verify `DATABASE_URL` is accessible
- Check PostgreSQL server is running
- Ensure user has permission to create tables

### Functions Not Found
- Run `netlify functions:list` to verify functions are created
- Check `netlify/functions/` directory exists with `.js` files

## Security Notes

⚠️ **Important**: 
- Never commit `.env.local` to version control
- Rotate `JWT_SECRET` regularly
- Passwords are hashed with SHA256 (use bcrypt for production)
- Implement proper authentication with JWT tokens in production
- Use HTTPS for all connections

## Further Improvements

For production, consider:
- Implement JWT token authentication
- Use bcrypt for password hashing
- Add input validation and sanitization
- Implement rate limiting
- Add user session management
- Use connection pooling for better performance
