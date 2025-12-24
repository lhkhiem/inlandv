// Script to run migration 046: Create industrial_parks tables
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Load environment variables
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config();
}

async function runMigration() {
  try {
    console.log('🔄 Running migration 046: Create industrial_parks tables...');
    
    // Read migration file
    const migrationPath = path.join(
      __dirname,
      '../../../../shared/database/migrations/046_create_industrial_parks.sql'
    );
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    // Build psql command
    const dbName = process.env.DB_NAME || 'inlandv_realestate';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    
    // Set PGPASSWORD environment variable for psql
    process.env.PGPASSWORD = dbPassword;
    
    // Use psql to execute the SQL file
    const psqlCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${migrationPath}"`;
    
    console.log(`Executing: psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f migration file`);
    
    const { stdout, stderr } = await execAsync(psqlCommand);
    
    if (stdout) {
      console.log(stdout);
    }
    
    if (stderr && !stderr.includes('NOTICE')) {
      // NOTICE messages are usually safe to ignore
      if (stderr.includes('ERROR')) {
        throw new Error(stderr);
      }
    }
    
    console.log('✅ Migration 046 completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - industrial_parks');
    console.log('   - industrial_park_images');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    if (error.stderr) {
      console.error('   stderr:', error.stderr);
    }
    if (error.stdout) {
      console.error('   stdout:', error.stdout);
    }
    
    // If psql is not found, provide alternative
    if (error.message.includes('psql') || error.code === 'ENOENT') {
      console.error('\n💡 psql command not found. Please either:');
      console.error('   1. Install PostgreSQL client tools');
      console.error('   2. Or run the SQL file manually in your database client');
      console.error(`   3. File location: ${path.join(__dirname, '../../../../shared/database/migrations/046_create_industrial_parks.sql')}`);
    }
    
    process.exit(1);
  }
}

runMigration();

