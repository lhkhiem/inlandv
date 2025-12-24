import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/pages/:slug - Get page by slug with sections (PUBLIC)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    // Get page
    const pageResult = await query(
      'SELECT * FROM pages WHERE slug = $1 AND published = true',
      [slug]
    )

    if (pageResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Page not found' 
      })
    }

    const page = pageResult.rows[0]

    // Get sections for this page
    const sectionsResult = await query(
      `SELECT * FROM page_sections 
       WHERE page_id = $1 AND published = true 
       ORDER BY display_order ASC, created_at ASC`,
      [page.id]
    )

    // Process sections to ensure images array is properly formatted
    const sections = (sectionsResult.rows || []).map((section: any) => {
      // Ensure images is always an array
      let images = section.images
      if (!images) {
        images = []
      } else if (typeof images === 'string') {
        // If images is a string, try to parse it as JSON array
        try {
          images = JSON.parse(images)
        } catch {
          // If not JSON, treat as single item array
          images = [images]
        }
      } else if (!Array.isArray(images)) {
        images = []
      }
      
      return {
        ...section,
        images: images
      }
    })

    const responseData = {
      ...page,
      sections: sections
    }
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Page "${slug}" found with ${sections.length} sections`)
      sections.forEach((section: any) => {
        console.log(`  - Section "${section.section_key}": ${section.images?.length || 0} images`)
      })
    }
    
    res.json({
      success: true,
      data: responseData
    })
  } catch (error: any) {
    console.error('Error fetching page:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch page',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router

