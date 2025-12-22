import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/posts - Get all posts with pagination (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query
    
    let queryText = 'SELECT * FROM posts WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    if (category) {
      paramCount++
      queryText += ` AND category = $${paramCount}`
      queryParams.push(category)
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
    console.error('Error fetching posts:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch posts' })
  }
})

// GET /api/posts/featured - Get featured posts (PUBLIC)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query
    
    const result = await query(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT $1',
      [limit]
    )

    res.json({
      success: true,
      data: result.rows,
    })
  } catch (error) {
    console.error('Error fetching featured posts:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch featured posts' })
  }
})

// GET /api/posts/:slug - Get post by slug (PUBLIC)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params
    
    const result = await query('SELECT * FROM posts WHERE slug = $1', [slug])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch post' })
  }
})

export default router

