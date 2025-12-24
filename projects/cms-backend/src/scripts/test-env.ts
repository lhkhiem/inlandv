// Quick test to verify .env.local is loaded correctly
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

console.log('');
console.log('========================================');
console.log('🔍 Testing Environment Variables Load');
console.log('========================================');
console.log('');

const cwd = process.cwd();
console.log(`Current working directory: ${cwd}`);
console.log('');

const envLocalPath = path.resolve(cwd, '.env.local');
const envPath = path.resolve(cwd, '.env');

console.log(`Looking for .env.local at: ${envLocalPath}`);
console.log(`File exists: ${fs.existsSync(envLocalPath)}`);
console.log('');

if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local file found!');
  console.log('');
  
  // Try to load it
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.log('❌ Error loading .env.local:');
    console.log(`   ${result.error.message}`);
  } else {
    console.log('✅ .env.local loaded successfully');
    console.log('');
    console.log('Environment variables:');
    console.log(`   DB_HOST: ${process.env.DB_HOST || '(not set)'}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT || '(not set)'}`);
    console.log(`   DB_USER: ${process.env.DB_USER || '(not set)'}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME || '(not set)'}`);
    console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : '(not set)'}`);
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '***' : '(not set)'}`);
    console.log(`   PORT: ${process.env.PORT || '(not set)'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '***' : '(not set)'}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`);
  }
} else {
  console.log('❌ .env.local file NOT found!');
  console.log('');
  console.log('Please create .env.local from env.local.example:');
  console.log('   cp env.local.example .env.local');
}

console.log('');
console.log('========================================');





