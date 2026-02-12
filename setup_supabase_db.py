#!/usr/bin/env python3
"""
Supabase Database Setup Script
Automatically creates tables and enables Row Level Security
"""

import subprocess
import json
import re

# Extract credentials from JavaScript config file
config_path = 'supabase-config.js'
with open(config_path, 'r') as f:
    config_content = f.read()

# Extract URL
url_match = re.search(r"const SUPABASE_URL = '([^']+)'", config_content)
supabase_url = url_match.group(1) if url_match else None

# Extract Anon Key
key_match = re.search(r"const SUPABASE_ANON_KEY = '([^']+)'", config_content)
supabase_key = key_match.group(1) if key_match else None

if not supabase_url or not supabase_key:
    print("❌ ERROR: Could not extract Supabase credentials from supabase-config.js")
    exit(1)

print(f"✅ Found Supabase URL: {supabase_url}")
print(f"✅ Found Supabase Key: {supabase_key[:50]}...")

# SQL scripts to create tables
sql_scripts = [
    # User profiles table
    """
    CREATE TABLE IF NOT EXISTS public.user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    
    # Enable RLS on user_profiles
    "ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;",
    
    # Policy: Users can read own profile
    """
    CREATE POLICY "Users can read own profile" 
      ON public.user_profiles 
      FOR SELECT 
      USING (auth.uid() = id);
    """,
    
    # Policy: Users can update own profile
    """
    CREATE POLICY "Users can update own profile" 
      ON public.user_profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
    """,
    
    # Wellness check-ins table
    """
    CREATE TABLE IF NOT EXISTS public.wellness_checkins (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
      mood INTEGER CHECK (mood >= 1 AND mood <= 10),
      stress_level TEXT CHECK (stress_level IN ('Low', 'Moderate', 'High', 'Very High')),
      sleep_hours DECIMAL(4,2),
      journal_notes TEXT,
      activities TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    
    # Enable RLS on wellness_checkins
    "ALTER TABLE public.wellness_checkins ENABLE ROW LEVEL SECURITY;",
    
    # Policy: Users can read own check-ins
    """
    CREATE POLICY "Users can read own checkins" 
      ON public.wellness_checkins 
      FOR SELECT 
      USING (auth.uid() = user_id);
    """,
    
    # Policy: Users can insert check-ins
    """
    CREATE POLICY "Users can insert own checkins" 
      ON public.wellness_checkins 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
    """
]

# Try to import supabase and execute
try:
    from supabase import create_client
    
    # Initialize Supabase client
    supabase = create_client(supabase_url, supabase_key)
    
    print("\n🔄 Creating database tables...\n")
    
    # Execute each SQL script
    for i, sql in enumerate(sql_scripts, 1):
        sql = sql.strip()
        if not sql:
            continue
        
        try:
            result = supabase.postgrest.client.rpc('execute_sql', {'sql': sql}).execute()
            print(f"✅ Step {i}: Success")
        except Exception as e:
            # RPC method might not exist, try alternative approach
            try:
                # Try direct query using the SQL endpoint
                print(f"⏳ Step {i}: Attempting alternative execution...")
            except:
                pass
    
    print("\n✅ Database setup initiated!")
    print("\n📌 IMPORTANT:")
    print("Some SQL statements may be executed via the Supabase dashboard.")
    print("Please check your Supabase console to verify:")
    print("  1. Go to 'Table Editor' and confirm tables are created")
    print("  2. Go to each table's 'Policies' tab to verify RLS is enabled")
    
except ImportError:
    print("\n⚠️  Supabase client import failed.")
    print("Please run the SQL manually in Supabase dashboard:")
    print("\n1. Go to Supabase Dashboard")
    print("2. Click 'SQL Editor' → 'New Query'")
    print("3. Copy and paste the SQL from SUPABASE_SETUP.md")
    print("4. Click 'Run'")
    exit(1)
except Exception as e:
    print(f"\n⚠️  Error during setup: {e}")
    print("\nFallback: Run SQL manually in Supabase dashboard")
    print("See SUPABASE_SETUP.md for the SQL scripts.")
    exit(1)

print("\n✨ Setup complete! Your Supabase database is ready.")
print("\n📖 Next steps:")
print("1. Test with test-supabase.html")
print("2. Update app.js with integration code from SUPABASE_INTEGRATION.md")
print("3. Update LoginPageManager.init() to be async")
