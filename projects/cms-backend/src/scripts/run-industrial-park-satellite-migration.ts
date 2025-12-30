// Script to run Industrial Park Satellite Tables Migration
// Migration 064: Create Industrial Park Satellite Tables and Remove Property Satellite Tables

import { Sequelize } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

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

// Try to get DATABASE_URL or construct from individual DB config
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  // Try to construct from individual DB config (similar to run-kcn-migration.ts)
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.DB_PORT || '5432';
  const DB_NAME = process.env.DB_NAME || process.env.DB_DATABASE || 'inlandv_realestate';
  const DB_USER = process.env.DB_USER || process.env.DB_USERNAME || 'inlandv_user';
  const DB_PASSWORD = process.env.DB_PASSWORD || '';
  
  DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  console.log(`📝 Using constructed DATABASE_URL: postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}\n`);
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function runMigration() {
  try {
    console.log('🔄 Starting Industrial Park Satellite Tables Migration (064)...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Ensure pgcrypto extension exists
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('✅ pgcrypto extension checked\n');

    // Read migration file
    // Path from projects/cms-backend/src/scripts to shared/database/migrations
    const migrationPath = path.resolve(__dirname, '../../../../shared/database/migrations/064_industrial_park_satellite_tables.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('📄 Migration file loaded\n');

    // Execute migration
    console.log('🚀 Executing migration...\n');
    await sequelize.query(migrationSQL);
    console.log('✅ Migration executed successfully\n');

    // Verification queries
    console.log('🔍 Verifying migration...\n');

    // Check industrial_park_product_types table
    const checkProductTypes: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industrial_park_product_types;
    `, { type: 'SELECT' });
    console.log(`   ✓ industrial_park_product_types table exists (${checkProductTypes[0].count} records)`);

    // Check industrial_park_transaction_types table
    const checkTransactionTypes: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industrial_park_transaction_types;
    `, { type: 'SELECT' });
    console.log(`   ✓ industrial_park_transaction_types table exists (${checkTransactionTypes[0].count} records)`);

    // Check industrial_park_location_types table
    const checkLocationTypes: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industrial_park_location_types;
    `, { type: 'SELECT' });
    console.log(`   ✓ industrial_park_location_types table exists (${checkLocationTypes[0].count} records)`);

    // Check that property satellite tables are dropped
    try {
      await sequelize.query('SELECT 1 FROM property_product_types LIMIT 1');
      console.log('   ⚠️  WARNING: property_product_types table still exists');
    } catch (e: any) {
      if (e.message?.includes('does not exist') || e.message?.includes('relation')) {
        console.log('   ✓ property_product_types table removed');
      } else {
        throw e;
      }
    }

    try {
      await sequelize.query('SELECT 1 FROM property_transaction_types LIMIT 1');
      console.log('   ⚠️  WARNING: property_transaction_types table still exists');
    } catch (e: any) {
      if (e.message?.includes('does not exist') || e.message?.includes('relation')) {
        console.log('   ✓ property_transaction_types table removed');
      } else {
        throw e;
      }
    }

    try {
      await sequelize.query('SELECT 1 FROM property_location_types LIMIT 1');
      console.log('   ⚠️  WARNING: property_location_types table still exists');
    } catch (e: any) {
      if (e.message?.includes('does not exist') || e.message?.includes('relation')) {
        console.log('   ✓ property_location_types table removed');
      } else {
        throw e;
      }
    }

    // Check view
    const checkView: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM v_industrial_parks_filter LIMIT 1;
    `, { type: 'SELECT' });
    console.log(`   ✓ v_industrial_parks_filter view exists`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Created industrial_park_product_types table');
    console.log('   - Created industrial_park_transaction_types table');
    console.log('   - Created industrial_park_location_types table');
    console.log('   - Removed property_product_types table');
    console.log('   - Removed property_transaction_types table');
    console.log('   - Removed property_location_types table');
    console.log('   - Created v_industrial_parks_filter view');
    console.log('   - Migrated data from properties to industrial_parks\n');

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigration();

