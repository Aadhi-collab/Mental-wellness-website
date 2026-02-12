#!/bin/bash

# Wellness Tracker - NeonDB Setup Script
# This script helps set up the project with NeonDB

echo "🚀 Wellness Tracker - NeonDB Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Skipping creation..."
else
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your NeonDB connection string"
fi

echo ""
echo "📦 Installing Netlify Functions dependencies..."
cd netlify/functions
npm install
cd ../..

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_URL in .env.local with your NeonDB connection string"
echo "2. Run: node db-init.js   (to initialize the database)"
echo "3. Run: npm run dev        (to start the development server)"
echo ""
echo "📚 For detailed instructions, see NEONDB_SETUP.md"
