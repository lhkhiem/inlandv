// Script to run migration 065: Rename product_types to industrial_park_types
import * as fs from 'fs';
import * as path from 'path';
import { Sequelize } from 'sequelize';
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
  // Try to construct from individual DB config
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

    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Ensure pgcrypto extension exists
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    console.log('✅ Ensured pgcrypto extension exists\n');

    // Read migration file
    const migrationPath = path.resolve(
      __dirname,
      '../../../../shared/database/migrations/065_rename_product_types_to_industrial_park_types.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('📄 Running migration 065: Rename product_types to industrial_park_types\n');

    // Execute migration
    await sequelize.query(migrationSQL);
    console.log('✅ Migration executed successfully\n');

    // Verification queries
    console.log('🔍 Verifying migration...\n');

    // Check if table was renamed
    const checkTable: any = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('product_types', 'industrial_park_types');
    `, { type: 'SELECT' });

    const tableNames = checkTable.map((row: any) => row.table_name);
    
    if (tableNames.includes('industrial_park_types') && !tableNames.includes('product_types')) {
      console.log('   ✓ Table renamed successfully: product_types → industrial_park_types');
    } else if (tableNames.includes('product_types')) {
      console.log('   ⚠️  WARNING: product_types table still exists');
    } else if (!tableNames.includes('industrial_park_types')) {
      console.log('   ⚠️  WARNING: industrial_park_types table not found');
    }

    // Check data in new table
    const checkData: any = await sequelize.query(`
      SELECT COUNT(*) as count FROM industrial_park_types;
    `, { type: 'SELECT' });
    console.log(`   ✓ industrial_park_types table has ${checkData[0].count} records`);

    // Check foreign key constraint
    const checkFK: any = await sequelize.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'industrial_park_product_types'
        AND kcu.column_name = 'product_type_code';
    `, { type: 'SELECT' });

    if (checkFK.length > 0 && checkFK[0].foreign_table_name === 'industrial_park_types') {
      console.log('   ✓ Foreign key constraint updated correctly');
    } else {
      console.log('   ⚠️  WARNING: Foreign key constraint may not be updated correctly');
    }

    // Check view
    const checkView: any = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name = 'v_industrial_parks_filter';
    `, { type: 'SELECT' });

    if (checkView[0].count > 0) {
      console.log('   ✓ View v_industrial_parks_filter updated');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nSummary:');
    console.log('   - Renamed product_types table to industrial_park_types');
    console.log('   - Updated foreign key constraints');
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

