@echo off
REM Supabase Database Setup Script
REM Extracts credentials from supabase-config.js and runs SQL setup

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Supabase Database Setup Script
echo ========================================
echo.

REM Read credentials from supabase-config.js
for /f "tokens=*" %%a in (supabase-config.js) do (
    if "!url!"=="" if not "!%%a:SUPABASE_URL=!"=="!%%a!" (
        for /f "tokens=2 delims='" %%b in ("%%a") do set url=%%b
    )
    if "!key!"=="" if not "!%%a:SUPABASE_ANON_KEY=!"=="!%%a!" (
        for /f "tokens=2 delims='" %%b in ("%%a") do set key=%%b
    )
)

if "!url!"=="" (
    echo ❌ ERROR: Could not find SUPABASE_URL
    echo Please check supabase-config.js
    pause
    exit /b 1
)

if "!key!"=="" (
    echo ❌ ERROR: Could not find SUPABASE_ANON_KEY
    echo Please check supabase-config.js
    pause
    exit /b 1
)

echo ✅ Found Supabase URL: !url!
echo ✅ Found Supabase Key: (configured)
echo.

echo 📌 Database Setup Instructions:
echo.
echo 1. Go to your Supabase project: https://supabase.com
echo 2. Navigate to SQL Editor in the left sidebar
echo 3. Click "New Query"
echo 4. Copy the SQL from SUPABASE_SETUP.md (all SQL blocks)
echo 5. Paste into the SQL Editor
echo 6. Click "Run"
echo.
echo ✅ Tables will be created automatically
echo    - user_profiles
echo    - wellness_checkins
echo.
echo Windows limitation:
echo Unfortunately, curl on this system cannot directly execute SQL via Supabase RPC.
echo You must run the SQL manually through the Supabase Dashboard.
echo.
echo 🔗 Direct link to SQL Editor:
echo !url!/project/_/sql/new
echo.
echo After running SQL:
echo 1. Open test-supabase.html in your browser
echo 2. Click "Test Configuration" to verify setup
echo.
pause
