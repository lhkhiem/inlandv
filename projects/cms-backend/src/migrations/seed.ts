import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cms_db',
  user: process.env.DB_USER || 'cms_user',
  password: process.env.DB_PASSWORD || 'cms_password',
});

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    const email = 'admin@inland.com';
    const password = 'admin123';
    const name = 'Admin';
    const role = 'owner';

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log(`⚠️  User ${email} already exists. Skipping seed.`);
      await pool.end();
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, email, name, role`,
      [email, passwordHash, name, role, 'active']
    );

    const user = result.rows[0];
    console.log('✅ Default user created successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();




