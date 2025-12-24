import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/industrial-parks - Get all industrial parks (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const {
      scope, // 'trong-kcn' | 'ngoai-kcn'
      has_rental, // boolean
      has_transfer, // boolean
      province,
      rental_price_min,
      rental_price_max,
      transfer_price_min,
      transfer_price_max,
      available_area_min,
      available_area_max,
      page = 1,
      limit = 12,
    } = req.query

    let queryText = 'SELECT * FROM industrial_parks WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0

    // Filter by scope
    if (scope) {
      paramCount++
      queryText += ` AND scope = $${paramCount}`
      queryParams.push(scope)
    }

    // Filter by has_rental
    if (has_rental !== undefined) {
      paramCount++
      queryText += ` AND has_rental = $${paramCount}`
      queryParams.push(has_rental === 'true' || has_rental === true)
    }

    // Filter by has_transfer
    if (has_transfer !== undefined) {
      paramCount++
      queryText += ` AND has_transfer = $${paramCount}`
      queryParams.push(has_transfer === 'true' || has_transfer === true)
    }

    // Filter by province
    if (province) {
      paramCount++
      queryText += ` AND province ILIKE $${paramCount}`
      queryParams.push(`%${province}%`)
    }

    // Filter by rental price range
    if (rental_price_min) {
      paramCount++
      queryText += ` AND rental_price_min >= $${paramCount}`
      queryParams.push(rental_price_min)
    }

    if (rental_price_max) {
      paramCount++
      queryText += ` AND rental_price_max <= $${paramCount}`
      queryParams.push(rental_price_max)
    }

    // Filter by transfer price range
    if (transfer_price_min) {
      paramCount++
      queryText += ` AND transfer_price_min >= $${paramCount}`
      queryParams.push(transfer_price_min)
    }

    if (transfer_price_max) {
      paramCount++
      queryText += ` AND transfer_price_max <= $${paramCount}`
      queryParams.push(transfer_price_max)
    }

    // Filter by available area range
    if (available_area_min) {
      paramCount++
      queryText += ` AND available_area >= $${paramCount}`
      queryParams.push(available_area_min)
    }

    if (available_area_max) {
      paramCount++
      queryText += ` AND available_area <= $${paramCount}`
      queryParams.push(available_area_max)
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM (${queryText}) as count_query`,
      queryParams
    )
    const total = parseInt(countResult.rows[0].count)

    // Add pagination
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(limit, offset)

    const result = await query(queryText, queryParams)

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Industrial Parks API] Query:', {
        filters: {
          scope,
          has_rental,
          has_transfer,
          province,
        },
        total,
        returned: result.rows.length,
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
    console.error('Error fetching industrial parks:', error)
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
    }
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch industrial parks', 
      error: error instanceof Error ? error.message : 'Unknown error',
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
      })
    })
  }
})

// GET /api/industrial-parks/:slug - Get industrial park by slug (PUBLIC)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    // Get industrial park data
    const parkResult = await query('SELECT * FROM industrial_parks WHERE slug = $1', [slug])

    if (parkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Industrial park not found' })
    }

    const park = parkResult.rows[0]

    // Get images for this industrial park
    let imagesResult = { rows: [] }
    try {
      // Try industrial_park_id first (from migration 046)
      imagesResult = await query(
        'SELECT id, industrial_park_id as park_id, url, caption, display_order, is_primary, created_at FROM industrial_park_images WHERE industrial_park_id = $1 ORDER BY display_order ASC, created_at ASC',
        [park.id]
      )
    } catch (err: any) {
      // If industrial_park_id doesn't exist, try park_id (from full-schema.sql)
      if (err.message?.includes('column') || err.message?.includes('does not exist')) {
        try {
          imagesResult = await query(
            'SELECT id, park_id, url, caption, display_order, is_primary, created_at FROM industrial_park_images WHERE park_id = $1 ORDER BY display_order ASC, created_at ASC',
            [park.id]
          )
        } catch (err2) {
          // Table might not exist, just set empty array
          console.warn('[API] Could not fetch images:', err2)
          imagesResult = { rows: [] }
        }
      } else {
        // Other error, just set empty array to avoid breaking the API
        console.warn('[API] Error fetching images:', err)
        imagesResult = { rows: [] }
      }
    }

    // Normalize image URLs: convert backslashes to forward slashes (Windows path to URL)
    const normalizePath = (path: string | null | undefined): string => {
      if (!path) return ''
      return path.replace(/\\/g, '/')
    }
    
    // Normalize thumbnail_url
    if (park.thumbnail_url) {
      park.thumbnail_url = normalizePath(park.thumbnail_url)
    }
    
    // Normalize video_url
    if (park.video_url) {
      park.video_url = normalizePath(park.video_url)
    }
    
    // Normalize image URLs in images array
    const images = (imagesResult?.rows || []).map((img: any) => ({
      ...img,
      url: normalizePath(img.url)
    }))
    
    // Attach normalized images to park data
    park.images = images
    
    // Process allowed_industries: prioritize column over separate table
    let allowedIndustries: any[] = []
    
    // Check if allowed_industries column exists in the result
    // PostgreSQL returns NULL as null, so we check if property exists
    const hasAllowedIndustriesColumn = 'allowed_industries' in park
    
    if (hasAllowedIndustriesColumn) {
      // Column exists - use it (could be NULL, empty array, or array with values)
      // Database now stores Vietnamese names directly (strings), not codes
      if (park.allowed_industries !== null && park.allowed_industries !== undefined) {
        if (Array.isArray(park.allowed_industries) && park.allowed_industries.length > 0) {
          // It's a text array with Vietnamese names (strings)
          // Return as array of strings (Vietnamese names with diacritics)
          allowedIndustries = park.allowed_industries.filter((name: string) => name && typeof name === 'string' && name.trim().length > 0)
          console.log('[API] Using allowed_industries from column (Vietnamese names):', allowedIndustries)
        } else {
          // Empty array or invalid format
          allowedIndustries = []
          console.log('[API] allowed_industries column exists but is empty/invalid, returning empty array')
        }
      } else {
        // Column is NULL - return empty array (don't fallback to separate table)
        allowedIndustries = []
        console.log('[API] allowed_industries column is NULL, returning empty array (not using separate table)')
      }
    } else {
      // Column doesn't exist in schema - fallback to separate table (backward compatibility)
      console.log('[API] allowed_industries column not found in schema, trying separate table')
      try {
        const industriesResult = await query(
          `SELECT 
            ipai.industry_code,
            COALESCE(i.name_vi, ipai.industry_code) as name
          FROM industrial_park_allowed_industries ipai
          LEFT JOIN industries i ON ipai.industry_code = i.code
          WHERE ipai.park_id = $1
          ORDER BY i.name_vi ASC, ipai.industry_code ASC`,
          [park.id]
        )
        allowedIndustries = industriesResult.rows || []
        console.log('[API] Fetched from separate table:', allowedIndustries.length)
      } catch (err: any) {
        // Table might not exist, try without join
        try {
          const industriesResult = await query(
            'SELECT industry_code as code FROM industrial_park_allowed_industries WHERE park_id = $1 ORDER BY industry_code ASC',
            [park.id]
          )
          allowedIndustries = industriesResult.rows || []
          console.log('[API] Fetched from separate table (no join):', allowedIndustries.length)
        } catch (err2) {
          console.warn('[API] Could not fetch allowed industries:', err2)
          allowedIndustries = []
        }
      }
    }
    
    // allowedIndustries is now an array of strings (Vietnamese names)
    // No need to resolve from industries table since DB stores Vietnamese names directly
    
    // Attach allowed industries to park data
    park.allowed_industries = allowedIndustries
    
    // Process infrastructure: could be JSONB object or separate columns
    let infrastructure: any = {}
    
    // Check if infrastructure exists as JSONB column
    if (park.infrastructure && typeof park.infrastructure === 'object') {
      // It's a JSONB object
      infrastructure = park.infrastructure
    } else {
      // Try to read from separate columns
      infrastructure = {
        road: park.infrastructure_road || false,
        power: park.infrastructure_power || false,
        water: park.infrastructure_water || false,
        internet: park.infrastructure_internet || false,
        drainage: park.infrastructure_drainage || false,
        waste: park.infrastructure_waste || false,
        security: park.infrastructure_security || false,
      }
    }
    
    // Attach infrastructure to park data (normalized format)
    park.infrastructure = infrastructure
    
    // Debug logging
    console.log('[API] Industrial Park ID:', park.id)
    console.log('[API] Park name:', park.name)
    console.log('[API] Thumbnail URL (normalized):', park.thumbnail_url)
    console.log('[API] Images found:', park.images.length)
    console.log('[API] Allowed industries found:', park.allowed_industries.length)
    if (park.allowed_industries.length > 0) {
      console.log('[API] Allowed industries data:', JSON.stringify(park.allowed_industries, null, 2))
    }
    console.log('[API] Infrastructure (normalized):', JSON.stringify(infrastructure, null, 2))
    if (park.images.length > 0) {
      console.log('[API] First image URL (normalized):', park.images[0]?.url)
      console.log('[API] Images data:', JSON.stringify(park.images.slice(0, 2), null, 2))
    }

    res.json({
      success: true,
      data: park,
    })
  } catch (error) {
    console.error('Error fetching industrial park:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch industrial park' })
  }
})

export default router

