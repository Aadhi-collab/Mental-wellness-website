#!/usr/bin/env node

/**
 * NeonDB Setup Verification Script
 * Checks if all components are properly configured
 * 
 * Usage: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

function print(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function checkFileExists(filePath, description) {
    const exists = fs.existsSync(filePath);
    if (exists) {
        print(`✅ ${description}`, 'green');
    } else {
        print(`❌ ${description} - NOT FOUND`, 'red');
    }
    return exists;
}

function checkEnvVariable(variable) {
    const exists = process.env[variable];
    if (exists) {
        print(`✅ ${variable} is set`, 'green');
    } else {
        print(`⚠️  ${variable} is not set (needed for production)`, 'yellow');
    }
    return exists;
}

console.clear();
print('\n🔍 NeonDB Setup Verification\n', 'blue');
print('================================\n', 'blue');

let passCount = 0;
let totalChecks = 0;

// Check Node.js
print('\n[1] Environment Checks', 'blue');
totalChecks++;
try {
    const version = process.version;
    print(`✅ Node.js version: ${version}`, 'green');
    passCount++;
} catch (error) {
    print(`❌ Node.js not found`, 'red');
}

// Check npm
totalChecks++;
try {
    require('child_process').execSync('npm --version');
    print(`✅ npm is installed`, 'green');
    passCount++;
} catch (error) {
    print(`❌ npm not found`, 'red');
}

// Check .env.local
print('\n[2] Configuration Files', 'blue');
totalChecks++;
const envLocal = checkFileExists('.env.local', '.env.local exists');
if (envLocal) passCount++;

// Check .gitignore includes .env.local
totalChecks++;
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env.local')) {
        print(`✅ .env.local is in .gitignore`, 'green');
        passCount++;
    } else {
        print(`⚠️  .env.local might be committed to git`, 'yellow');
    }
} catch (error) {
    print(`⚠️  Could not verify .gitignore`, 'yellow');
}

// Check netlify.toml
print('\n[3] Netlify Configuration', 'blue');
totalChecks++;
const netlifToml = checkFileExists('netlify.toml', 'netlify.toml exists');
if (netlifToml) passCount++;

// Verify functions directory
totalChecks++;
const functionsDir = checkFileExists('netlify/functions', 'netlify/functions directory exists');
if (functionsDir) passCount++;

// Check individual functions
totalChecks++;
const authFunction = checkFileExists('netlify/functions/auth.js', 'auth.js function exists');
if (authFunction) passCount++;

totalChecks++;
const entriesFunction = checkFileExists('netlify/functions/entries.js', 'entries.js function exists');
if (entriesFunction) passCount++;

totalChecks++;
const dbFunction = checkFileExists('netlify/functions/db.js', 'db.js utility exists');
if (dbFunction) passCount++;

// Check dependencies
print('\n[4] Dependencies', 'blue');
totalChecks++;
const packageJsonFunctions = checkFileExists('netlify/functions/package.json', 'netlify/functions/package.json exists');
if (packageJsonFunctions) passCount++;

totalChecks++;
const nodeModulesFunctions = checkFileExists('netlify/functions/node_modules', 'netlify/functions/node_modules exists');
if (nodeModulesFunctions) {
    print(`✅ Dependencies are installed`, 'green');
    passCount++;
} else {
    print(`⚠️  Dependencies not installed. Run: npm run setup`, 'yellow');
}

// Check API service
print('\n[5] Frontend API', 'blue');
totalChecks++;
const apiService = checkFileExists('api-service.js', 'api-service.js exists');
if (apiService) passCount++;

// Check HTML includes api-service.js
totalChecks++;
try {
    const html = fs.readFileSync('index.html', 'utf8');
    if (html.includes('api-service.js')) {
        print(`✅ index.html includes api-service.js`, 'green');
        passCount++;
    } else {
        print(`❌ index.html does not include api-service.js`, 'red');
    }
} catch (error) {
    print(`❌ Could not read index.html`, 'red');
}

// Check documentation
print('\n[6] Documentation', 'blue');
totalChecks++;
const neondbSetup = checkFileExists('NEONDB_SETUP.md', 'NEONDB_SETUP.md exists');
if (neondbSetup) passCount++;

totalChecks++;
const quickRef = checkFileExists('QUICK_REFERENCE.md', 'QUICK_REFERENCE.md exists');
if (quickRef) passCount++;

totalChecks++;
const setupChecklist = checkFileExists('SETUP_CHECKLIST.md', 'SETUP_CHECKLIST.md exists');
if (setupChecklist) passCount++;

// Environment variables
print('\n[7] Environment Variables', 'blue');
totalChecks++;
const envExists = fs.existsSync('.env.local');
if (envExists) {
    try {
        const envLocal = fs.readFileSync('.env.local', 'utf8');
        if (envLocal.includes('DATABASE_URL')) {
            if (envLocal.includes('postgresql://')) {
                print(`✅ DATABASE_URL appears to be configured`, 'green');
                passCount++;
            } else {
                print(`⚠️  DATABASE_URL is set but may not be valid`, 'yellow');
            }
        } else {
            print(`❌ DATABASE_URL not found in .env.local`, 'red');
        }
    } catch (error) {
        print(`⚠️  Could not read .env.local`, 'yellow');
    }
} else {
    print(`❌ .env.local file not found! Create it: cp .env.example .env.local`, 'red');
}

// Summary
print('\n================================', 'blue');
const percentage = Math.round((passCount / totalChecks) * 100);
print(`\n📊 Results: ${passCount}/${totalChecks} checks passed (${percentage}%)\n`, 'blue');

if (percentage === 100) {
    print('✨ Everything looks good! Ready to deploy. ✨', 'green');
    print('\nNext steps:', 'green');
    print('1. Run: node db-init.js', 'green');
    print('2. Run: npm run dev', 'green');
    print('3. Visit: http://localhost:8888', 'green');
} else if (percentage >= 80) {
    print('⚠️  Most checks passed, but some items need attention.', 'yellow');
    print('\nTo complete setup:', 'yellow');
    print('1. Check items marked with ❌ above', 'yellow');
    print('2. Run: npm run setup', 'yellow');
    print('3. Run: node db-init.js', 'yellow');
    print('4. Run: npm run dev', 'yellow');
} else {
    print('❌ Setup incomplete. Please address the issues above.', 'red');
    print('\nQuick start:', 'red');
    print('1. cp .env.example .env.local', 'red');
    print('2. npm run setup', 'red');
    print('3. node db-init.js', 'red');
    print('4. npm run dev', 'red');
}

print('\n📚 Documentation:', 'blue');
print('   - NEONDB_SETUP.md - Full setup guide', 'blue');
print('   - QUICK_REFERENCE.md - Commands and APIs', 'blue');
print('   - SETUP_CHECKLIST.md - Step-by-step checklist', 'blue');
print('\n', 'blue');

process.exit(percentage === 100 ? 0 : 1);
