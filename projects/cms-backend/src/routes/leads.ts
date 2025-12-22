import { Router } from 'express'
import { query } from '../database/db'
import { authenticate, isAdmin } from '../middleware/auth'

const router = Router()

// GET /api/leads - Get all leads (ADMIN ONLY)
router.get('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, source } = req.query
    
    let queryText = 'SELECT * FROM leads WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (source) {
      paramCount++
      queryText += ` AND source = $${paramCount}`
      queryParams.push(source)
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
    console.error('Error fetching leads:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch leads' })
  }
})

export default router

