import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

import projectRoutes from './routes/projects'
import listingRoutes from './routes/listings'
import propertyRoutes from './routes/properties'
import industrialParkRoutes from './routes/industrial-parks'
import productRoutes from './routes/products'
import lookupRoutes from './routes/lookup'
import postRoutes from './routes/posts'
import leadRoutes from './routes/leads'
import jobRoutes from './routes/jobs'
import pageRoutes from './routes/pages'
import settingsRoutes from './routes/settings'

// Load .env.local first, then fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4002',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Serve static files from shared-storage/uploads (for assets)
const STORAGE_BASE = process.env.STORAGE_PATH || path.join(process.cwd(), '..', 'shared-storage')
const UPLOADS_DIR = path.join(STORAGE_BASE, 'uploads')

// Middleware to serve assets by ID (before static middleware)
// Handles requests like /uploads/{uuid}/ or /uploads/{uuid}
app.use('/uploads', async (req, res, next) => {
  // When using app.use('/uploads', ...), req.path is the path after '/uploads'
  // So for /uploads/50ba9024-8225-431a-9fb6-42065aaaade9/, req.path will be "/50ba9024-8225-431a-9fb6-42065aaaade9/"
  const originalPath = req.path
  const cleanPath = originalPath.replace(/^\/+|\/+$/g, '') // Remove leading/trailing slashes
  const pathMatch = cleanPath.match(/^([^\/]+)$/)
  
  if (pathMatch) {
    const potentialId = pathMatch[1]
    
    // Check if it looks like a UUID (with or without dashes)
    // Also check if it's a short numeric ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(potentialId)
    const isShortNumeric = /^\d+$/.test(potentialId)
    
    if (isUUID || isShortNumeric) {
      try {
        // Import query function dynamically to avoid circular dependencies
        const { query } = await import('./database/db')
        
        // Try to find asset by ID in database
        const assetResult = await query(
          'SELECT id, url, original_url FROM assets WHERE id = $1',
          [potentialId]
        )
        
        if (assetResult.rows.length > 0) {
          const asset = assetResult.rows[0]
          const assetUrl = asset.url || asset.original_url
          
          if (assetUrl) {
            // Remove leading /uploads if present to get relative path
            const relativePath = assetUrl.startsWith('/uploads/') 
              ? assetUrl.substring('/uploads/'.length)
              : assetUrl.startsWith('/')
                ? assetUrl.substring(1)
                : assetUrl
            
            const filePath = path.join(UPLOADS_DIR, relativePath)
            
            // Check if file exists
            if (fs.existsSync(filePath)) {
              // Determine content type
              const ext = path.extname(filePath).toLowerCase()
              const mimeTypes: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
              }
              
              const contentType = mimeTypes[ext] || 'application/octet-stream'
              
              // Set headers and send file
              res.setHeader('Content-Type', contentType)
              res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[AssetServe] Serving file by ID:', potentialId, '->', filePath)
              }
              
              // Use absolute path for sendFile
              const absolutePath = path.resolve(filePath)
              return res.sendFile(absolutePath, (err) => {
                if (err) {
                  console.error('[AssetServe] Error sending file:', err)
                  if (!res.headersSent) {
                    res.status(500).send('Error serving file')
                  }
                }
              })
            } else {
              if (process.env.NODE_ENV === 'development') {
                console.warn('[AssetServe] File not found:', filePath)
              }
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('[AssetServe] Asset not found in database:', potentialId)
          }
        }
      } catch (error) {
        // If error, fall through to static middleware
        console.error('[AssetServe] Error serving asset by ID:', error)
      }
    }
  }
  
  // Fall through to static middleware
  next()
})

// Serve static files from shared-storage/uploads (for assets)
if (fs.existsSync(UPLOADS_DIR)) {
  app.use('/uploads', express.static(UPLOADS_DIR))
  console.log(`📁 Serving static files from: ${UPLOADS_DIR}`)
}

// Routes (PUBLIC ONLY - No authentication required)
app.use('/api/projects', projectRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/industrial-parks', industrialParkRoutes)
app.use('/api/products', productRoutes)
app.use('/api/lookup', lookupRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/settings', settingsRoutes)

// Health check
app.get('/health', async (req, res) => {
  try {
    const { query } = await import('./database/db')
    await query('SELECT 1')
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Public Backend API running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:4002'}`)
})

export default app

