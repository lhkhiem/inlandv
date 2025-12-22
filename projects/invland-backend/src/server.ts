import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import projectRoutes from './routes/projects'
import listingRoutes from './routes/listings'
import postRoutes from './routes/posts'
import leadRoutes from './routes/leads'
import jobRoutes from './routes/jobs'

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

// Routes (PUBLIC ONLY - No authentication required)
app.use('/api/projects', projectRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/jobs', jobRoutes)

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

