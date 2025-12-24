import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import * as path from 'path';
import sequelize from './config/database';
// Import models to initialize associations
import './models';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import topicRoutes from './routes/topics';
import menuLocationRoutes from './routes/menuLocations';
import menuItemRoutes from './routes/menuItems';
import settingsRoutes from './routes/settings';
import pageMetadataRoutes from './routes/pageMetadata';
import activityLogRoutes from './routes/activityLogs';
import assetRoutes from './routes/assets';
import faqRoutes from './routes/faq';
import trackingScriptRoutes from './routes/trackingScripts';
import newsletterRoutes from './routes/newsletter';
import leadsRoutes from './routes/leads';
import propertiesRoutes from './routes/properties';
import industrialParksRoutes from './routes/industrialParks';
import newsRoutes from './routes/news';
import newsCategoriesRoutes from './routes/newsCategories';
import jobsRoutes from './routes/jobs';
import jobApplicationsRoutes from './routes/jobApplications';
import pagesRoutes from './routes/pages';
import pageSectionsRoutes from './routes/pageSections';
import Asset from './models/Asset';

// Load .env.local first, then fallback to .env
import * as fs from 'fs';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

// Try to load .env.local first
if (fs.existsSync(envLocalPath)) {
  const result = dotenv.config({ path: envLocalPath });
  if (result.error && process.env.NODE_ENV === 'development') {
    console.warn('[App] Warning loading .env.local:', result.error.message);
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[App] Loaded .env.local');
  }
} else if (process.env.NODE_ENV === 'development') {
  console.warn('[App] .env.local not found at:', envLocalPath);
}

// Fallback to .env
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Try default location
}

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
  // Public frontend origins
  'http://localhost:4000',
  'http://localhost:3000',
  `http://${publicIp}:4000`,
  `http://${publicIp}:3000`,
  process.env.PUBLIC_FRONTEND_ORIGIN || 'http://localhost:4000',
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

// Storage configuration - use shared-storage for both CMS and public site
const STORAGE_BASE = process.env.STORAGE_PATH || path.join(process.cwd(), '..', 'shared-storage');
const UPLOADS_DIR = path.join(STORAGE_BASE, 'uploads');

// Middleware to serve assets by ID (before static middleware)
// Handles requests like /uploads/{uuid}/ or /uploads/{uuid}
app.use('/uploads', async (req, res, next) => {
  // When using app.use('/uploads', ...), req.path is the path after '/uploads'
  // So for /uploads/50ba9024-8225-431a-9fb6-42065aaaade9/, req.path will be "/50ba9024-8225-431a-9fb6-42065aaaade9/"
  const originalPath = req.path;
  const cleanPath = originalPath.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
  const pathMatch = cleanPath.match(/^([^\/]+)$/);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[AssetServe] Request:', { 
      method: req.method, 
      originalPath, 
      cleanPath, 
      hasMatch: !!pathMatch 
    });
  }
  
  if (pathMatch) {
    const potentialId = pathMatch[1];
    
    // Check if it looks like a UUID (with or without dashes)
    // Also check if it's a short numeric ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialId);
    const isShortNumeric = /^\d+$/.test(potentialId);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[AssetServe] ID check:', { potentialId, isUUID, isShortNumeric });
    }
    
    if (isUUID || isShortNumeric) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[AssetServe] Attempting to serve asset by ID:', potentialId);
        }
        
        // Try to find asset by ID
        const asset = await Asset.findByPk(potentialId);
        
        if (asset) {
          const assetData = asset.toJSON() as any;
          const assetUrl = assetData.url || assetData.original_url;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[AssetServe] Found asset:', { id: potentialId, url: assetUrl });
          }
          
          if (assetUrl) {
            // Remove leading /uploads if present to get relative path
            const relativePath = assetUrl.startsWith('/uploads/') 
              ? assetUrl.substring('/uploads/'.length)
              : assetUrl.startsWith('/')
                ? assetUrl.substring(1)
                : assetUrl;
            
            const filePath = path.join(UPLOADS_DIR, relativePath);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('[AssetServe] File path:', filePath, 'exists:', fs.existsSync(filePath));
            }
            
            // Check if file exists
            if (fs.existsSync(filePath)) {
              // Determine content type
              const ext = path.extname(filePath).toLowerCase();
              const mimeTypes: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
              };
              
              const contentType = mimeTypes[ext] || 'application/octet-stream';
              
              // Set headers and send file
              res.setHeader('Content-Type', contentType);
              res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[AssetServe] Serving file:', filePath);
              }
              
              // Use absolute path for sendFile
              const absolutePath = path.resolve(filePath);
              return res.sendFile(absolutePath, (err) => {
                if (err) {
                  console.error('[AssetServe] Error sending file:', err);
                  if (!res.headersSent) {
                    res.status(500).send('Error serving file');
                  }
                }
              });
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[AssetServe] File not found:', filePath);
              }
            }
          } else {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[AssetServe] Asset has no URL:', potentialId);
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[AssetServe] Asset not found in database:', potentialId);
          }
        }
      } catch (error) {
        // If error, fall through to static middleware
        console.error('[AssetServe] Error serving asset by ID:', error);
      }
    }
  }
  
  // Fall through to static middleware
  next();
});

// Serve static files from shared-storage/uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/menu-locations', menuLocationRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/page-metadata', pageMetadataRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/tracking-scripts', trackingScriptRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/industrial-parks', industrialParksRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/news-categories', newsCategoriesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/job-applications', jobApplicationsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/page-sections', pageSectionsRoutes);

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
  // Ensure one admin exists (skip owner bootstrap as constraint only allows 'admin' or 'sale')
  // Note: The users table constraint only allows 'admin' or 'sale' roles
  // If you need 'owner' role, update the constraint in migration 001_initial_schema.sql
  try {
    const [admin] = await sequelize.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`, { type: 'SELECT' as any });
    if (!(admin as any)?.id) {
      const first: any = await sequelize.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`, { type: 'SELECT' as any });
      const id = (first as any[])[0]?.id;
      if (id) {
        await sequelize.query(`UPDATE users SET role = 'admin' WHERE id = :id`, { type: 'UPDATE' as any, replacements: { id } });
        console.log('Promoted earliest user to admin');
      }
    }
  } catch (e) {
    console.warn('Admin bootstrap failed or skipped:', e);
  }
}

