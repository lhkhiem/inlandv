import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/jobs - Get all jobs (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    
    const countResult = await query('SELECT COUNT(*) FROM jobs')
    const total = parseInt(countResult.rows[0].count)

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    
    const result = await query(
      'SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    )

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/:slug - Get job by slug (PUBLIC)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    const result = await query('SELECT * FROM jobs WHERE slug = $1', [slug])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch job' })
  }
})

export default router

