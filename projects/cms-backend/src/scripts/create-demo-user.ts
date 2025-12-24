// Create Demo User Script
// Tạo demo user để test CMS

import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
import * as fs from 'fs';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

// Try to load .env.local first
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error) {
    console.warn('[Script] Warning loading .env.local:', result.error.message);
  }
} else {
  // Try relative path from script location
  const relativePath = path.join(__dirname, '../../.env.local');
  if (fs.existsSync(relativePath)) {
    dotenv.config({ path: relativePath });
  }
}

// Fallback to .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Try default location
}

// Create pool with proper config
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'inlandv_realestate',
  user: process.env.DB_USER || 'inlandv_user',
  password: process.env.DB_PASSWORD || 'EKYvccPcharP',
});

const DEMO_EMAIL = 'demo@inland.com';
const DEMO_PASSWORD = 'demo123';
const DEMO_NAME = 'Demo User';
const DEMO_ROLE = 'admin';

async function createDemoUser() {
  try {
    console.log('');
    console.log('========================================');
    console.log('🔧 Creating Demo User');
    console.log('========================================');
    console.log(`   Email: ${DEMO_EMAIL}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log(`   Name: ${DEMO_NAME}`);
    console.log(`   Role: ${DEMO_ROLE}`);
    console.log('');
    
    // Test database connection
    console.log('[1/4] Testing database connection...');
    await pool.query('SELECT 1');
    console.log('   ✅ Connected');

    // Check if user already exists
    console.log('[2/4] Checking if demo user exists...');
    const existingUser = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [DEMO_EMAIL]
    );

    if (existingUser.rows.length > 0) {
      console.log('   ⚠️  Demo user already exists!');
      console.log(`   User ID: ${existingUser.rows[0].id}`);
      console.log('');
      console.log('Demo Credentials:');
      console.log(`   Email: ${DEMO_EMAIL}`);
      console.log(`   Password: ${DEMO_PASSWORD}`);
      console.log('');
      console.log('To recreate, delete first:');
      console.log('   .\\scripts\\setup\\delete-demo-user-api.ps1');
      await pool.end();
      process.exit(0);
    }
    console.log('   ✅ User does not exist, proceeding...');

    // Hash password
    console.log('[3/4] Hashing password...');
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    console.log('   ✅ Password hashed');

    // Insert demo user
    console.log('[4/4] Inserting demo user into database...');
    
    // Check which columns exist
    const columnsCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsCheck.rows.map((row: any) => row.column_name);
    console.log(`   Available columns: ${existingColumns.join(', ')}`);
    
    // Build INSERT query dynamically based on existing columns
    const insertColumns: string[] = ['email', 'password_hash', 'name', 'role'];
    const insertParams: any[] = [DEMO_EMAIL, passwordHash, DEMO_NAME, DEMO_ROLE];
    let paramIndex = insertParams.length;
    
    // Add optional columns if they exist
    if (existingColumns.includes('is_active')) {
      insertColumns.push('is_active');
      insertParams.push(true);
      paramIndex++;
    } else if (existingColumns.includes('status')) {
      // Legacy support for old schema
      insertColumns.push('status');
      insertParams.push('active');
      paramIndex++;
    }
    
    // Build placeholders for parameterized values
    const placeholders: string[] = [];
    for (let i = 0; i < paramIndex; i++) {
      placeholders.push(`$${i + 1}`);
    }
    
    // Add timestamp columns if they exist (use CURRENT_TIMESTAMP directly)
    if (existingColumns.includes('created_at')) {
      insertColumns.push('created_at');
      placeholders.push('CURRENT_TIMESTAMP');
    }
    
    if (existingColumns.includes('updated_at')) {
      insertColumns.push('updated_at');
      placeholders.push('CURRENT_TIMESTAMP');
    }
    
    const insertQuery = `
      INSERT INTO users (${insertColumns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id, email, name, role
    `;
    
    const result = await pool.query(insertQuery, insertParams);

    const user = result.rows[0];
    console.log('   ✅ User inserted');
    console.log('');
    console.log('========================================');
    console.log('✅ Demo User Created Successfully!');
    console.log('========================================');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log('');
    console.log('📝 Demo credentials are displayed on the login page.');
    console.log('');

  } catch (error: any) {
    console.error('❌ Error creating demo user:', error.message);
    if (error.code === '23505') {
      console.error('   User already exists (unique constraint violation)');
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createDemoUser();

