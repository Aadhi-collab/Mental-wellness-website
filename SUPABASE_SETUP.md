# Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Project name: `wellness-tracker`
   - Database password: Create a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Get API Keys
1. In your Supabase project, go to Settings → API
2. Copy:
   - **Project URL** → `SUPABASE_URL` in supabase-config.js
   - **Anon (public) key** → `SUPABASE_ANON_KEY` in supabase-config.js

## Step 3: Create Database Tables

### Table 1: user_profiles
In Supabase SQL Editor, run:

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Create policy for users to update their own data
CREATE POLICY "Users can update own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);
```

### Table 2: wellness_checkins
```sql
CREATE TABLE public.wellness_checkins (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 10),
  stress_level TEXT CHECK (stress_level IN ('Low', 'Moderate', 'High', 'Very High')),
  sleep_hours DECIMAL(4,2),
  journal_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.wellness_checkins ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own check-ins
CREATE POLICY "Users can read own checkins" 
  ON public.wellness_checkins 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for users to insert check-ins
CREATE POLICY "Users can insert own checkins" 
  ON public.wellness_checkins 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

## Step 4: Enable Authentication
1. In Supabase, go to Authentication → Providers
2. Enable "Email" provider (should be enabled by default)
3. Go to Settings → General and note your API URL and Anon Key

## Step 5: Add Script to HTML
Add this to your `index.html` in the `<head>` section (before app.js):

```html
<!-- Supabase Client Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0"></script>

<!-- Supabase Configuration -->
<script src="supabase-config.js"></script>
```

## Step 6: Update Configuration
In `supabase-config.js`:
- Replace `YOUR_SUPABASE_URL` with your Project URL
- Replace `YOUR_SUPABASE_ANON_KEY` with your Anon Key

## Testing
1. Open your app in browser
2. Register a new account
3. Check Supabase Dashboard:
   - Authentication → Users (see registered user)
   - SQL Editor → `SELECT * FROM user_profiles` (see profile)

## Important Security Notes
- Never commit real API keys to version control
- Use environment variables in production
- Enable Row Level Security (RLS) for data protection
- Regularly review authentication policies
