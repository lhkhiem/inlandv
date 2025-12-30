// Script to run KCN Redesign migration
// Usage: npm run migrate:kcn or ts-node src/scripts/run-kcn-migration.ts

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cms_db',
  user: process.env.DB_USER || 'cms_user',
  password: process.env.DB_PASSWORD || 'cms_password',
});

async function runKCNMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting KCN Redesign Migration...');
    console.log(`Database: ${process.env.DB_NAME || 'cms_db'}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
    console.log('');

    // Ensure pgcrypto extension exists
    console.log('Ensuring pgcrypto extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // Migration 061: Create lookup tables
    console.log('📋 Running migration 061: Create lookup tables...');
    // Path from projects/cms-backend/src/scripts to shared/database/migrations
    const migration061Path = path.resolve(__dirname, '../../../../shared/database/migrations/061_kcn_redesign_lookup_tables.sql');
    if (!fs.existsSync(migration061Path)) {
      throw new Error(`Migration file not found: ${migration061Path}`);
    }
    const migration061 = fs.readFileSync(migration061Path, 'utf8');
    await client.query(migration061);
    console.log('✅ Migration 061 completed');
    console.log('');

    // Migration 062: Migrate data
    console.log('📋 Running migration 062: Migrate existing data...');
    const migration062Path = path.resolve(__dirname, '../../../../shared/database/migrations/062_kcn_redesign_migrate_data.sql');
    if (!fs.existsSync(migration062Path)) {
      throw new Error(`Migration file not found: ${migration062Path}`);
    }
    const migration062 = fs.readFileSync(migration062Path, 'utf8');
    await client.query(migration062);
    console.log('✅ Migration 062 completed');
    console.log('');

    // Verify migration
    console.log('🔍 Verifying migration...');
    const productCount = await client.query('SELECT COUNT(DISTINCT property_id) as count FROM property_product_types');
    const transactionCount = await client.query('SELECT COUNT(DISTINCT property_id) as count FROM property_transaction_types');
    const locationCount = await client.query('SELECT COUNT(DISTINCT property_id) as count FROM property_location_types');
    const totalKCN = await client.query('SELECT COUNT(*) as count FROM properties WHERE main_category = \'kcn\'');

    console.log(`  Properties with product types: ${productCount.rows[0].count}`);
    console.log(`  Properties with transaction types: ${transactionCount.rows[0].count}`);
    console.log(`  Properties with location types: ${locationCount.rows[0].count}`);
    console.log(`  Total KCN properties: ${totalKCN.rows[0].count}`);
    console.log('');

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runKCNMigration();

