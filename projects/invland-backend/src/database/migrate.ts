import pool from './db'
import * as fs from 'fs'
import * as path from 'path'

async function migrate() {
  try {
    console.log('🔄 Starting database migration...')
    
    // Path to shared schema
    const schemaPath = path.join(__dirname, '../../../../shared/database/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    
    console.log('✅ Database migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()

