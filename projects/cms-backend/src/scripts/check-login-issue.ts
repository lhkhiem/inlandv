// Script to diagnose login issues
// Usage: npm run check-login-issue (add to package.json) or ts-node src/scripts/check-login-issue.ts

import sequelize from '../config/database';
import User from '../models/User';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local first, then fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

// Try to load .env.local first
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.warn('[Script] Warning loading .env.local:', result.error.message);
  } else {
    console.log('[Script] Loaded .env.local from:', envLocalPath);
  }
} else {
  console.warn('[Script] .env.local not found at:', envLocalPath);
}

// Fallback to .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Try default location
}

async function checkLoginIssue() {
  console.log('');
  console.log('========================================');
  console.log('🔍 Checking Login Issue');
  console.log('========================================');
  console.log('');

  try {
    // 1. Check environment variables
    console.log('[1/5] Checking environment variables...');
    const dbUrl = process.env.DATABASE_URL;
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbName = process.env.DB_NAME || 'inlandv_realestate';
    const dbUser = process.env.DB_USER || 'postgres';
    
    if (dbUrl) {
      console.log(`   ✅ DATABASE_URL is set`);
    } else {
      console.log(`   ⚠️  DATABASE_URL not set, using individual fields:`);
      console.log(`      Host: ${dbHost}`);
      console.log(`      Port: ${dbPort}`);
      console.log(`      Database: ${dbName}`);
      console.log(`      User: ${dbUser}`);
    }
    console.log('');

    // 2. Test database connection
    console.log('[2/5] Testing database connection...');
    try {
      await sequelize.authenticate();
      console.log('   ✅ Database connection successful');
    } catch (error: any) {
      console.log('   ❌ Database connection failed!');
      console.log(`      Error: ${error.message}`);
      console.log('');
      console.log('   💡 Solutions:');
      console.log('      1. Check PostgreSQL is running');
      console.log('      2. Verify DATABASE_URL or DB_* variables in .env.local');
      console.log('      3. Ensure database exists: createdb inlandv_realestate');
      process.exit(1);
    }
    console.log('');

    // 3. Check if users table exists
    console.log('[3/5] Checking if users table exists...');
    try {
      const [results] = await sequelize.query("SELECT COUNT(*) as count FROM users");
      const count = (results as any[])[0]?.count || 0;
      console.log(`   ✅ Users table exists (${count} users)`);
    } catch (error: any) {
      console.log('   ❌ Users table does not exist!');
      console.log(`      Error: ${error.message}`);
      console.log('');
      console.log('   💡 Solution: Run migrations');
      console.log('      npm run migrate');
      process.exit(1);
    }
    console.log('');

    // 4. Check for demo user
    console.log('[4/5] Checking for demo user...');
    const demoUser = await User.findOne({ where: { email: 'demo@inland.com' } });
    if (demoUser) {
      console.log('   ✅ Demo user exists');
      console.log(`      ID: ${demoUser.id}`);
      console.log(`      Email: ${demoUser.email}`);
      console.log(`      Name: ${demoUser.name}`);
      console.log(`      Role: ${(demoUser as any).role}`);
      console.log(`      Has password_hash: ${!!demoUser.password_hash}`);
      
      if (!demoUser.password_hash) {
        console.log('   ⚠️  WARNING: Demo user has no password_hash!');
        console.log('   💡 Solution: Recreate demo user');
        console.log('      npm run create-demo-user');
      }
    } else {
      console.log('   ❌ Demo user does not exist!');
      console.log('');
      console.log('   💡 Solution: Create demo user');
      console.log('      npm run create-demo-user');
    }
    console.log('');

    // 5. Check JWT_SECRET
    console.log('[5/5] Checking JWT configuration...');
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret && jwtSecret.length >= 32) {
      console.log('   ✅ JWT_SECRET is set (length >= 32)');
    } else if (jwtSecret) {
      console.log('   ⚠️  JWT_SECRET is too short (should be >= 32 characters)');
    } else {
      console.log('   ⚠️  JWT_SECRET not set, using default "secret"');
    }
    console.log('');

    console.log('========================================');
    console.log('✅ All checks completed');
    console.log('========================================');
    console.log('');
    
    if (!demoUser || !demoUser.password_hash) {
      console.log('📝 Next steps:');
      console.log('   1. Create demo user: npm run create-demo-user');
      console.log('   2. Try logging in again');
      console.log('');
    } else {
      console.log('✅ Everything looks good!');
      console.log('   If login still fails, check server logs for detailed errors.');
      console.log('');
    }

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkLoginIssue();

