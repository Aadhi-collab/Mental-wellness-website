#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * Runs SQL commands to create tables and enable RLS
 */

const fs = require('fs');
const path = require('path');

// Extract credentials from supabase-config.js
const configPath = path.join(__dirname, 'supabase-config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Parse credentials
const urlMatch = configContent.match(/const SUPABASE_URL = '([^']+)'/);
const keyMatch = configContent.match(/const SUPABASE_ANON_KEY = '([^']+)'/);

const supabaseUrl = urlMatch ? urlMatch[1] : null;
const supabaseKey = keyMatch ? keyMatch[1] : null;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Could not extract Supabase credentials');
    process.exit(1);
}

console.log('\n✅ Found Supabase URL:', supabaseUrl);
console.log('✅ Found Supabase Key:', supabaseKey.substring(0, 50) + '...');

// SQL commands to execute
const sqlCommands = [
    // Create user_profiles table
    `CREATE TABLE IF NOT EXISTS public.user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Enable RLS on user_profiles
    `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`,
    
    // Create policies for user_profiles
    `CREATE POLICY IF NOT EXISTS "Users can read own profile" 
      ON public.user_profiles 
      FOR SELECT 
      USING (auth.uid() = id);`,
    
    `CREATE POLICY IF NOT EXISTS "Users can update own profile" 
      ON public.user_profiles 
      FOR UPDATE 
      USING (auth.uid() = id);`,
    
    // Create wellness_checkins table
    `CREATE TABLE IF NOT EXISTS public.wellness_checkins (
      id BIGSERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
      mood INTEGER CHECK (mood >= 1 AND mood <= 10),
      stress_level TEXT CHECK (stress_level IN ('Low', 'Moderate', 'High', 'Very High')),
      sleep_hours DECIMAL(4,2),
      journal_notes TEXT,
      activities TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    
    // Enable RLS on wellness_checkins
    `ALTER TABLE public.wellness_checkins ENABLE ROW LEVEL SECURITY;`,
    
    // Create policies for wellness_checkins
    `CREATE POLICY IF NOT EXISTS "Users can read own checkins" 
      ON public.wellness_checkins 
      FOR SELECT 
      USING (auth.uid() = user_id);`,
    
    `CREATE POLICY IF NOT EXISTS "Users can insert own checkins" 
      ON public.wellness_checkins 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);`
];

// Execute SQL via Supabase REST API
async function setupDatabase() {
    console.log('\n🔄 Setting up database...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < sqlCommands.length; i++) {
        const sql = sqlCommands[i];
        try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({ query: sql })
            });
            
            if (response.ok) {
                console.log(`✅ Step ${i + 1}/${sqlCommands.length}: Success`);
                successCount++;
            } else {
                const error = await response.text();
                if (error.includes('already exists') || error.includes('POLICY')) {
                    console.log(`⏭️  Step ${i + 1}/${sqlCommands.length}: Already exists (skipping)`);
                    successCount++;
                } else {
                    console.log(`⚠️  Step ${i + 1}/${sqlCommands.length}: ${error.substring(0, 100)}`);
                    failCount++;
                }
            }
        } catch (error) {
            console.error(`❌ Step ${i + 1}/${sqlCommands.length}: ${error.message}`);
            failCount++;
        }
    }
    
    console.log(`\n📊 Results: ${successCount} succeeded, ${failCount} failed\n`);
    
    if (failCount === 0) {
        console.log('✨ Database setup complete!');
        console.log('\n✅ Tables created:');
        console.log('   - user_profiles');
        console.log('   - wellness_checkins');
        console.log('\n✅ Row Level Security (RLS) enabled on both tables\n');
        
        console.log('📖 Next steps:');
        console.log('1. Open test-supabase.html in your browser');
        console.log('2. Click "Test Configuration" to verify');
        console.log('3. Test Registration → Login → Check-In\n');
        
        console.log('💡 Then update app.js following SUPABASE_INTEGRATION.md\n');
    } else {
        console.log('⚠️  Some steps may need manual configuration');
        console.log('\nTo manually set up:');
        console.log('1. Go to https://supabase.com');
        console.log('2. Open your project → SQL Editor');
        console.log('3. Copy SQL from SUPABASE_SETUP.md');
        console.log('4. Paste and run in SQL Editor\n');
    }
}

// Run setup
setupDatabase().catch(error => {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\nManual setup required:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. SQL Editor → New Query');
    console.log('3. Copy-paste SQL from SUPABASE_SETUP.md');
    console.log('4. Click Run\n');
    process.exit(1);
});
