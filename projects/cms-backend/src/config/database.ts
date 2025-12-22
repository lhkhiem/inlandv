// Cấu hình kết nối PostgreSQL qua Sequelize
// - Đọc thông tin kết nối từ env vars
// - Fallback values cho development
// - Logging SQL chỉ trong môi trường development

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'cms_user',
  password: process.env.DB_PASSWORD || 'cms_password',
  database: process.env.DB_NAME || 'cms_db',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;




