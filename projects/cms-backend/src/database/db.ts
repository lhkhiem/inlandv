import { Pool } from 'pg'
import dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local first, then fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local')
const envPath = path.resolve(process.cwd(), '.env')

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath })
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

// Support both DATABASE_URL and individual fields
// Priority: Individual fields > DATABASE_URL (to allow override)
let connectionConfig: any

// Check if individual DB fields are set (preferred method)
const dbHost = process.env.DB_HOST
const dbPort = process.env.DB_PORT
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME

if (dbHost && dbUser && dbPassword && dbName) {
  // Use individual fields if all are provided
  connectionConfig = {
    host: dbHost,
    port: parseInt(dbPort || '5432'),
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
  
  console.log(`[DB] Using individual DB config: ${dbUser}@${dbHost}:${dbPort || '5432'}/${dbName}`)
} else if (process.env.DATABASE_URL) {
  // Fallback to DATABASE_URL if individual fields not set
  connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
  console.log(`[DB] Using DATABASE_URL`)
} else {
  // Default fallback
  connectionConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'inlandv_realestate',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }
  console.warn(`[DB] Using default config (postgres@localhost:5432/inlandv_realestate)`)
}

const pool = new Pool(connectionConfig)

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
  process.exit(-1)
})

export const query = async (text: string, params?: any[]) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

export default pool

