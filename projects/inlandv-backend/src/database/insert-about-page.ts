import pool from './db'
import * as fs from 'fs'
import * as path from 'path'

async function insertAboutPage() {
  try {
    console.log('🔄 Inserting about page data...')
    
    // Path to migration file
    const migrationPath = path.join(__dirname, '../../../../shared/database/migrations/057_insert_about_page_data.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    await pool.query(migrationSQL)
    
    console.log('✅ About page data inserted successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Insert failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

insertAboutPage()

















