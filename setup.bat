@echo off
REM Wellness Tracker - NeonDB Setup Script (Windows)
REM This script helps set up the project with NeonDB

echo.
echo 🚀 Wellness Tracker - NeonDB Setup
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo.

REM Check if .env.local exists
if exist .env.local (
    echo ⚠️  .env.local already exists. Skipping creation...
) else (
    echo 📝 Creating .env.local from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please update .env.local with your NeonDB connection string
)

echo.
echo 📦 Installing Netlify Functions dependencies...
cd netlify\functions
call npm install
cd ..\..

echo.
echo ✨ Setup complete!
echo.
echo Next steps:
echo 1. Update DATABASE_URL in .env.local with your NeonDB connection string
echo 2. Run: node db-init.js   (to initialize the database)
echo 3. Run: npm run dev        (to start the development server)
echo.
echo 📚 For detailed instructions, see NEONDB_SETUP.md
echo.
pause
