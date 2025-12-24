// Cấu hình kết nối PostgreSQL qua Sequelize
// - Đọc thông tin kết nối từ .env.local
// - Fallback values cho development
// - Logging SQL chỉ trong môi trường development

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local first, then fallback to .env
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

// Try to load .env.local first
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error && process.env.NODE_ENV === 'development') {
    console.warn('[Database] Warning loading .env.local:', result.error.message);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[Database] Loaded .env.local');
  }
} else if (process.env.NODE_ENV === 'development') {
  console.warn('[Database] .env.local not found at:', envLocalPath);
}

// Fallback to .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Try default location
}

// Support both DATABASE_URL and individual fields
let sequelize: Sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if provided
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
} else {
  // Use individual fields
  sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'inlandv_realestate',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  });
}

export default sequelize;




