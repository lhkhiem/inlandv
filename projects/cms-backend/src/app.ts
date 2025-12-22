import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import sequelize from './config/database';
// Import models to initialize associations
import './models';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import topicRoutes from './routes/topics';
import menuLocationRoutes from './routes/menuLocations';
import menuItemRoutes from './routes/menuItems';

dotenv.config();

export const app = express();

// Middleware
// CORS with credentials to support cookie-based auth from Admin app
const publicIp = process.env.PUBLIC_IP || 'localhost';

const allowedOrigins = [
  process.env.ADMIN_ORIGIN || 'http://localhost:4003', // CMS Frontend
  `http://${publicIp}:4003`, // CMS Frontend qua IP public
  'http://localhost:4003',
  'http://127.0.0.1:4003',
  'http://[::1]:4003', // IPv6 localhost
];

app.use(cors({
  origin: (origin, callback) => {
    // Request không có Origin (như Postman, server-to-server) → cho phép
    if (!origin) {
      return callback(null, true);
    }
    // Nếu origin nằm trong whitelist → cho phép
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Origin lạ → chặn và báo lỗi rõ ràng
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/menu-locations', menuLocationRoutes);
app.use('/api/menu-items', menuItemRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export async function ready() {
  await sequelize.authenticate();
  // Ensure one owner exists
  try {
    const [owner] = await sequelize.query(`SELECT id FROM users WHERE role = 'owner' LIMIT 1`, { type: 'SELECT' as any });
    if (!(owner as any)?.id) {
      const first: any = await sequelize.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`, { type: 'SELECT' as any });
      const id = (first as any[])[0]?.id;
      if (id) {
        await sequelize.query(`UPDATE users SET role = 'owner' WHERE id = :id`, { type: 'UPDATE' as any, replacements: { id } });
        console.log('Promoted earliest user to owner');
      }
    }
  } catch (e) {
    console.warn('Owner bootstrap failed or skipped:', e);
  }
}

