import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/posts - Get all posts with pagination (PUBLIC)
// Supports both 'posts' table (old) and 'news' table (new) with category_id
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query
    
    // Check if 'news' table exists (new schema) or use 'posts' (old schema)
    let queryText = ''
    const queryParams: any[] = []
    let paramCount = 0

    // Try to use 'news' table first (new schema with category_id)
    // If it doesn't exist, fallback to 'posts' table (old schema with category string)
    try {
      // Check if news table exists by trying a simple query
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'news'
        )
      `)
      
      const hasNewsTable = tableCheck.rows[0].exists
      
      if (hasNewsTable) {
        // Use 'news' table with JOIN to news_categories
        queryText = `
          SELECT 
            n.id,
            n.title,
            n.slug,
            n.thumbnail as thumbnail_url,
            n.excerpt,
            n.content,
            n.author,
            n.featured,
            n.view_count,
            n.published_at,
            n.created_at,
            n.updated_at,
            COALESCE(nc.slug, 'tin-thi-truong') as category
          FROM news n
          LEFT JOIN news_categories nc ON n.category_id = nc.id
          WHERE 1=1
        `
        
        // Filter by category (can be slug or name from news_categories)
        if (category) {
          paramCount++
          // Try to match by category slug first, then name
          // Support both slug format (tin-thi-truong) and name format (Tin thị trường)
          queryText += ` AND (nc.slug = $${paramCount} OR nc.name = $${paramCount} OR nc.name ILIKE $${paramCount} OR nc.slug ILIKE $${paramCount})`
          queryParams.push(category)
        }
        
        // Only show published posts (published_at IS NOT NULL)
        // For public API, we should only show published
        // But for now, show all posts to debug (can be filtered later)
        // queryText += ` AND n.published_at IS NOT NULL`
      } else {
        // Fallback to 'posts' table (old schema)
        queryText = 'SELECT * FROM posts WHERE 1=1'
        
        if (category) {
          paramCount++
          queryText += ` AND category = $${paramCount}`
          queryParams.push(category)
        }
      }
    } catch (tableError) {
      // If error checking table, fallback to 'posts'
      console.warn('Error checking news table, using posts table:', tableError)
      queryText = 'SELECT * FROM posts WHERE 1=1'
      
      if (category) {
        paramCount++
        queryText += ` AND category = $${paramCount}`
        queryParams.push(category)
      }
    }

    const countResult = await query(`SELECT COUNT(*) FROM (${queryText}) as count_query`, queryParams)
    const total = parseInt(countResult.rows[0].count)

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(limit, offset)

    const result = await query(queryText, queryParams)

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Posts API] Query:', {
        category,
        total,
        returned: result.rows.length,
        firstItem: result.rows[0] ? {
          id: result.rows[0].id,
          title: result.rows[0].title,
          category: result.rows[0].category,
        } : null,
      })
    }

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
    // Log full error details
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch posts',
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
      })
    })
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
    
    // Try 'news' table first, then fallback to 'posts'
    let result
    try {
      const tableCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'news'
        )
      `)
      
      const hasNewsTable = tableCheck.rows[0].exists
      
      if (hasNewsTable) {
        result = await query(`
          SELECT 
            n.id,
            n.title,
            n.slug,
            n.thumbnail as thumbnail_url,
            n.excerpt,
            n.content,
            n.author,
            n.featured,
            n.view_count,
            n.published_at,
            n.created_at,
            n.updated_at,
            COALESCE(nc.slug, nc.name, 'tin-thi-truong') as category
          FROM news n
          LEFT JOIN news_categories nc ON n.category_id = nc.id
          WHERE n.slug = $1
        `, [slug])
      } else {
        result = await query('SELECT * FROM posts WHERE slug = $1', [slug])
      }
    } catch (tableError) {
      // Fallback to posts table
      result = await query('SELECT * FROM posts WHERE slug = $1', [slug])
    }

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

