// Script to run migration 066: Create Industrial Park Supporting Tables
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
    console.log('🔄 Starting Industrial Park Supporting Tables Migration (066)...\n');

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Ensure pgcrypto extension exists
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('✅ Ensured pgcrypto extension exists\n');

    // Read migration file
    const migrationPath = path.resolve(
      __dirname,
      '../../../../shared/database/migrations/066_create_industrial_park_supporting_tables.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('📄 Running migration 066: Create Industrial Park Supporting Tables\n');

    // Execute migration
    await sequelize.query(migrationSQL);
    console.log('✅ Migration executed successfully\n');

    // Verification queries
    console.log('🔍 Verifying migration...\n');

    // Check industries table
    const checkIndustries: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industries;
    `, { type: 'SELECT' });
    console.log(`   ✓ industries table exists (${checkIndustries[0].count} records)`);

    // Check industrial_park_allowed_industries table
    const checkAllowedIndustries: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industrial_park_allowed_industries;
    `, { type: 'SELECT' });
    console.log(`   ✓ industrial_park_allowed_industries table exists (${checkAllowedIndustries[0].count} records)`);

    // Check industrial_park_documents table
    const checkDocuments: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industrial_park_documents;
    `, { type: 'SELECT' });
    console.log(`   ✓ industrial_park_documents table exists (${checkDocuments[0].count} records)`);

    // Check view
    const checkView: any = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name = 'v_industrial_parks_filter';
    `, { type: 'SELECT' });

    if (checkView[0].count > 0) {
      console.log('   ✓ View v_industrial_parks_filter updated with allowed_industries');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('   - Created industries lookup table (10 default industries)');
    console.log('   - Created industrial_park_allowed_industries junction table');
    console.log('   - Created industrial_park_documents table');
    console.log('   - Updated view v_industrial_parks_filter');

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
















