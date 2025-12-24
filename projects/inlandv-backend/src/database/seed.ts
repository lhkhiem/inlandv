import pool from './db'
import * as fs from 'fs'
import * as path from 'path'

async function seed() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Path to shared seed data
    const seedPath = path.join(__dirname, '../../../../shared/database/seeds/sample_data.sql')
    
    if (!fs.existsSync(seedPath)) {
      console.log('⚠️  Seed file not found, skipping...')
      process.exit(0)
    }
    
    const seedData = fs.readFileSync(seedPath, 'utf8')
    
    await pool.query(seedData)
    
    console.log('✅ Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seed()








