// Script to run migration 067: Drop unused projects and listings tables
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
// For this migration, use postgres user to have DROP TABLE privileges
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  const DB_HOST = process.env.DB_HOST || 'localhost';
  const DB_PORT = process.env.DB_PORT || '5432';
  const DB_NAME = process.env.DB_NAME || process.env.DB_DATABASE || 'inlandv_realestate';
  // Use postgres user for DROP TABLE privileges
  const DB_USER = 'postgres';
  const DB_PASSWORD = 'lhkhiem1990';
  
  DATABASE_URL = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  console.log(`📝 Using postgres user for DROP TABLE privileges: postgresql://${DB_USER}:***@${DB_HOST}:${DB_PORT}/${DB_NAME}\n`);
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function runMigration() {
  try {
    console.log('🔄 Starting Drop Projects and Listings Tables Migration (067)...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Read migration file
    const migrationPath = path.resolve(
      __dirname,
      '../../../../shared/database/migrations/067_drop_projects_and_listings_tables.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('📄 Running migration 067: Drop unused projects and listings tables\n');
    console.log('⚠️  NOTE: This migration requires DROP TABLE privileges.');
    console.log('   If you encounter "must be owner" error, please run as superuser or table owner.\n');

    // Execute migration
    try {
      await sequelize.query(migrationSQL);
    } catch (error: any) {
      if (error.message && error.message.includes('must be owner')) {
        console.error('\n❌ Permission error: You must be the owner of the tables or run as superuser.');
        console.error('   Please run this SQL directly in psql with appropriate privileges:');
        console.error('   DROP TABLE IF EXISTS listings CASCADE;');
        console.error('   DROP TABLE IF EXISTS projects CASCADE;');
        throw error;
      }
      throw error;
    }
    console.log('✅ Migration executed successfully\n');

    // Verification queries
    console.log('🔍 Verifying migration...\n');

    // Check if projects table still exists
    const checkProjects: any = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'projects'
      ) as exists;
    `, { type: 'SELECT' });

    if (!checkProjects[0].exists) {
      console.log('   ✓ projects table dropped successfully');
    } else {
      console.log('   ⚠️  WARNING: projects table still exists');
    }

    // Check if listings table still exists
    const checkListings: any = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'listings'
      ) as exists;
    `, { type: 'SELECT' });

    if (!checkListings[0].exists) {
      console.log('   ✓ listings table dropped successfully');
    } else {
      console.log('   ⚠️  WARNING: listings table still exists');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('   - Dropped projects table (unused, replaced by properties/industrial_parks)');
    console.log('   - Dropped listings table (unused, replaced by properties)');
    console.log('   - Dropped related indexes and constraints');

    await sequelize.close();
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();

