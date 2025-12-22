import { Router } from 'express'
import { query } from '../database/db'
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/projects - Get all projects (ADMIN - with full data)
router.get('/', authenticate, isAdmin, async (req, res) => {
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
    console.error('Error fetching projects:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch projects' })
  }
})

// GET /api/projects/:id - Get project by ID (ADMIN)
router.get('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await query('SELECT * FROM projects WHERE id = $1', [id])

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

// POST /api/projects - Create new project (ADMIN)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      location,
      price_min,
      price_max,
      area_min,
      area_max,
      status,
      thumbnail_url,
      gallery,
    } = req.body

    const result = await query(
      `INSERT INTO projects 
       (title, slug, description, location, price_min, price_max, area_min, area_max, status, thumbnail_url, gallery) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [title, slug, description, location, price_min, price_max, area_min, area_max, status, thumbnail_url, JSON.stringify(gallery || [])]
    )

    res.status(201).json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ success: false, message: 'Failed to create project' })
  }
})

// PUT /api/projects/:id - Update project (ADMIN)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      description,
      location,
      price_min,
      price_max,
      area_min,
      area_max,
      status,
      thumbnail_url,
      gallery,
    } = req.body

    const result = await query(
      `UPDATE projects 
       SET title = $1, description = $2, location = $3, price_min = $4, price_max = $5, 
           area_min = $6, area_max = $7, status = $8, thumbnail_url = $9, gallery = $10, updated_at = NOW()
       WHERE id = $11 
       RETURNING *`,
      [title, description, location, price_min, price_max, area_min, area_max, status, thumbnail_url, JSON.stringify(gallery || []), id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    res.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ success: false, message: 'Failed to update project' })
  }
})

// DELETE /api/projects/:id - Delete project (ADMIN)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' })
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ success: false, message: 'Failed to delete project' })
  }
})

export default router

