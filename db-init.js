#!/usr/bin/env node

/**
 * Database Migration Script
 * Run this script to initialize the NeonDB database tables
 * 
 * Usage:
 *   NODE_ENV=production node db-init.js
 *   
 * Make sure to set DATABASE_URL in your environment variables before running
 */

// Try to load dotenv, but don't fail if it's not installed
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not installed, that's okay
    console.log('⚠️  Running without dotenv - ensure DATABASE_URL is set');
}

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// If DATABASE_URL is not set, try reading from .env.local
if (!process.env.DATABASE_URL) {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/DATABASE_URL=(.+)/);
        if (match) {
            process.env.DATABASE_URL = match[1];
        }
    }
}

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    console.error('Add DATABASE_URL to your .env file');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Initializing database...\n');

        // Create users table
        console.log('📝 Creating users table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created\n');

        // Create wellness_entries table
        console.log('📝 Creating wellness_entries table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS wellness_entries (
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
            )
        `);
        console.log('✅ Wellness entries table created\n');

        // Create indexes
        console.log('📝 Creating indexes...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_wellness_entries_user_id ON wellness_entries(user_id)
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_wellness_entries_date ON wellness_entries(date)
        `);
        console.log('✅ Indexes created\n');

        // Insert demo user
        console.log('📝 Creating demo user...');
        const crypto = require('crypto');
        const demoPasswordHash = crypto.createHash('sha256').update('password123').digest('hex');
        
        await client.query(`
            INSERT INTO users (username, password_hash)
            VALUES ($1, $2)
            ON CONFLICT (username) DO NOTHING
        `, ['user123', demoPasswordHash]);
        console.log('✅ Demo user created (username: user123, password: password123)\n');

        console.log('✨ Database initialization completed successfully!\n');
        console.log('📊 Database Schema:');
        console.log('   - users: Stores user accounts');
        console.log('   - wellness_entries: Stores mood, sleep, and stress entries\n');

    } catch (error) {
        console.error('❌ Database initialization error:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

initializeDatabase();
