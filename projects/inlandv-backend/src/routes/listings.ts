import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/listings - Get all listings (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { project_id, type, page = 1, limit = 12 } = req.query
    
    let queryText = 'SELECT * FROM listings WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (project_id) {
      paramCount++
      queryText += ` AND project_id = $${paramCount}`
      queryParams.push(project_id)
    }

    if (type) {
      paramCount++
      queryText += ` AND type = $${paramCount}`
      queryParams.push(type)
    }

    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) as count_query`, queryParams)
    const total = parseInt(countResult.rows[0].count)

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
    console.error('Error fetching listings:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch listings' })
  }
})

// GET /api/listings/:id - Get listing by ID (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await query('SELECT * FROM listings WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching listing:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch listing' })
  }
})

export default router

