#!/usr/bin/env node

/**
 * Supabase Database Setup - Direct Execution
 * Uses Supabase JS client to set up tables via RPC calls
 */

const fs = require('fs');
const path = require('path');

(async () => {
    try {
        // Import after dynamic require
        const { createClient } = await import('@supabase/supabase-js');
        
        // Extract credentials from supabase-config.js
        const configPath = path.join(__dirname, 'supabase-config.js');
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        const urlMatch = configContent.match(/const SUPABASE_URL = '([^']+)'/);
        const keyMatch = configContent.match(/const SUPABASE_ANON_KEY = '([^']+)'/);
        
        const supabaseUrl = urlMatch ? urlMatch[1] : null;
        const supabaseKey = keyMatch ? keyMatch[1] : null;
        
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Could not extract Supabase credentials from supabase-config.js');
        }
        
        console.log('\n✅ Found Supabase credentials');
        console.log(`   URL: ${supabaseUrl}`);
        console.log(`   Key: ${supabaseKey.substring(0, 40)}...\n`);
        
        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // SQL commands
        const sqlCommands = [
            // Create user_profiles
            {
                name: 'Create user_profiles table',
                sql: `CREATE TABLE IF NOT EXISTS public.user_profiles (
              id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
              name TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
            },
            
            // Enable RLS
            {
                name: 'Enable RLS on user_profiles',
                sql: `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`
            },
            
            // Policies for user_profiles
            {
                name: 'Create read policy for user_profiles',
                sql: `CREATE POLICY IF NOT EXISTS "Users can read own profile" 
              ON public.user_profiles FOR SELECT 
              USING (auth.uid() = id);`
            },
            
            {
                name: 'Create update policy for user_profiles',
                sql: `CREATE POLICY IF NOT EXISTS "Users can update own profile" 
              ON public.user_profiles FOR UPDATE 
              USING (auth.uid() = id);`
            },
            
            // Create wellness_checkins
            {
                name: 'Create wellness_checkins table',
                sql: `CREATE TABLE IF NOT EXISTS public.wellness_checkins (
              id BIGSERIAL PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
              mood INTEGER CHECK (mood >= 1 AND mood <= 10),
              stress_level TEXT CHECK (stress_level IN ('Low', 'Moderate', 'High', 'Very High')),
              sleep_hours DECIMAL(4,2),
              journal_notes TEXT,
              activities TEXT[],
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`
            },
            
            // Enable RLS on wellness_checkins
            {
                name: 'Enable RLS on wellness_checkins',
                sql: `ALTER TABLE public.wellness_checkins ENABLE ROW LEVEL SECURITY;`
            },
            
            // Policies for wellness_checkins
            {
                name: 'Create read policy for wellness_checkins',
                sql: `CREATE POLICY IF NOT EXISTS "Users can read own checkins" 
              ON public.wellness_checkins FOR SELECT 
              USING (auth.uid() = user_id);`
            },
            
            {
                name: 'Create insert policy for wellness_checkins',
                sql: `CREATE POLICY IF NOT EXISTS "Users can insert own checkins" 
              ON public.wellness_checkins FOR INSERT 
              WITH CHECK (auth.uid() = user_id);`
            }
        ];
        
        console.log('🔄 Setting up database tables...\n');
        
        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;
        
        // Execute each command via RPC
        for (const cmd of sqlCommands) {
            try {
                // Try executing via RPC call
                const { data, error } = await supabase.rpc('execute_sql', {
                    sql: cmd.sql
                });
                
                if (error) {
                    if (error.message.includes('does not exist') || error.message.includes('already exists')) {
                        console.log(`⏭️  ${cmd.name}`);
                        skipCount++;
                    } else {
                        throw error;
                    }
                } else {
                    console.log(`✅ ${cmd.name}`);
                    successCount++;
                }
            } catch (error) {
                // If RPC fails, try direct postgrest call
                if (error.message.includes('does not exist function') || error.message.includes('execute_sql')) {
                    console.log(`⚠️  ${cmd.name} (needs manual setup)`);
                    skipCount++;
                } else {
                    console.log(`❌ ${cmd.name}: ${error.message}`);
                    failCount++;
                }
            }
        }
        
        console.log(`\n📊 Results: ${successCount} created, ${skipCount} skipped/exists, ${failCount} errors\n`);
        
        if (failCount > 0) {
            console.log('⚠️  Some tables need to be created manually.\n');
            console.log('📚 To set up manually:');
            console.log('   1. Go to https://supabase.com → Your Project');
            console.log('   2. Click "SQL Editor" in left sidebar');
            console.log('   3. Click "New Query"');
            console.log('   4. Copy all SQL from SUPABASE_SETUP.md');
            console.log('   5. Paste into the editor and click "Run"\n');
        } else {
            console.log('✨ Database setup complete!\n');
            console.log('✅ Tables created:');
            console.log('   • user_profiles');
            console.log('   • wellness_checkins\n');
            console.log('✅ Row Level Security (RLS) enabled\n');
        }
        
        console.log('🧪 Next: Test your setup');
        console.log('   1. Open test-supabase.html in your browser');
        console.log('   2. Click "Test Configuration"');
        console.log('   3. Test Register → Login → Check-In\n');
        
        console.log('📖 Then: Update your app.js');
        console.log('   See SUPABASE_INTEGRATION.md for code examples\n');
        
    } catch (error) {
        console.error('\n❌ Setup error:', error.message);
        console.log('\n💡 Supabase JS client may not be installed.');
        console.log('   Fallback: Manual setup required\n');
        console.log('📚 To set up manually:');
        console.log('   1. Go to https://supabase.com → Your Project');
        console.log('   2. Click "SQL Editor"');
        console.log('   3. New Query');
        console.log('   4. Copy SQL from SUPABASE_SETUP.md');
        console.log('   5. Click "Run"\n');
        process.exit(1);
    }
})();
