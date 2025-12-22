import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/projects - Get all projects with filters and pagination (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { location, type, status, price_min, price_max, page = 1, limit = 12 } = req.query
    
    let queryText = 'SELECT * FROM projects WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (location) {
      paramCount++
      queryText += ` AND location ILIKE $${paramCount}`
      queryParams.push(`%${location}%`)
    }

    if (status) {
      paramCount++
      queryText += ` AND status = $${paramCount}`
      queryParams.push(status)
    }

    if (price_min) {
      paramCount++
      queryText += ` AND price_min >= $${paramCount}`
      queryParams.push(price_min)
    }

    if (price_max) {
      paramCount++
      queryText += ` AND price_max <= $${paramCount}`
      queryParams.push(price_max)
    }

    // Count total
    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) as count_query`, queryParams)
    const total = parseInt(countResult.rows[0].count)

    // Add pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(limit, offset)

    const result = await query(queryText, queryParams)

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
    console.error('Error fetching projects:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch projects' })
  }
})

// GET /api/projects/featured - Get featured projects (PUBLIC)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query
    
    const result = await query(
      'SELECT * FROM projects WHERE status = $1 ORDER BY created_at DESC LIMIT $2',
      ['dang-mo-ban', limit]
    )

    res.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch featured projects' })
  }
})

// GET /api/projects/:slug - Get project by slug (PUBLIC)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    const result = await query('SELECT * FROM projects WHERE slug = $1', [slug])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch project' })
  }
})

export default router

