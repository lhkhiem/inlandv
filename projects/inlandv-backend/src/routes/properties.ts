import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/properties - Get all properties (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const {
      main_category,
      sub_category,
      property_type,
      transaction_type,
      status,
      province,
      price_min,
      price_max,
      area_min,
      area_max,
      q, // Search query
      page = 1,
      limit = 12,
    } = req.query

    let queryText = 'SELECT * FROM properties WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0
    let finalQueryText = '' // For error logging

    // Filter by property_type (schema uses 'type' column)
    if (property_type) {
      paramCount++
      queryText += ` AND type = $${paramCount}`
      queryParams.push(property_type)
    }

    // Filter by transaction_type (schema uses has_rental and has_transfer)
    if (transaction_type) {
      if (transaction_type === 'cho-thue') {
        queryText += ` AND has_rental = true`
      } else if (transaction_type === 'chuyen-nhuong') {
        queryText += ` AND has_transfer = true`
      }
    }

    // Filter by status (if not specified, show all except deleted/sold if needed)
    if (status) {
      paramCount++
      queryText += ` AND status = $${paramCount}`
      queryParams.push(status)
    }
    // Note: If status is not specified, we show all properties (including available, sold, rented, reserved)
    // This allows frontend to filter as needed

    // Filter by province
    if (province) {
      paramCount++
      queryText += ` AND province ILIKE $${paramCount}`
      queryParams.push(`%${province}%`)
    }

    // Filter by price range
    // Schema migration 047 has: sale_price, sale_price_min, sale_price_max, rental_price, rental_price_min, rental_price_max
    // Need to handle both single price and price range (min/max)
    if (price_min || price_max) {
      const priceMinParam = price_min || 0
      const priceMaxParam = price_max || 999999999999
      
      if (transaction_type === 'cho-thue') {
        // Filter by rental_price or rental_price_min/rental_price_max
        // A property matches if:
        // - rental_price is within range, OR
        // - rental_price_min/rental_price_max overlaps with the filter range
        queryText += ` AND (
          (rental_price IS NOT NULL AND rental_price >= $${paramCount + 1} AND rental_price <= $${paramCount + 2}) OR
          (rental_price_min IS NOT NULL AND rental_price_max IS NOT NULL AND rental_price_min <= $${paramCount + 2} AND rental_price_max >= $${paramCount + 1}) OR
          (rental_price_min IS NOT NULL AND rental_price_max IS NULL AND rental_price_min <= $${paramCount + 2}) OR
          (rental_price_min IS NULL AND rental_price_max IS NOT NULL AND rental_price_max >= $${paramCount + 1})
        )`
        queryParams.push(priceMinParam, priceMaxParam)
        paramCount += 2 // Used 2 params
      } else if (transaction_type === 'chuyen-nhuong') {
        // Filter by sale_price or sale_price_min/sale_price_max
        queryText += ` AND (
          (sale_price IS NOT NULL AND sale_price >= $${paramCount + 1} AND sale_price <= $${paramCount + 2}) OR
          (sale_price_min IS NOT NULL AND sale_price_max IS NOT NULL AND sale_price_min <= $${paramCount + 2} AND sale_price_max >= $${paramCount + 1}) OR
          (sale_price_min IS NOT NULL AND sale_price_max IS NULL AND sale_price_min <= $${paramCount + 2}) OR
          (sale_price_min IS NULL AND sale_price_max IS NOT NULL AND sale_price_max >= $${paramCount + 1})
        )`
        queryParams.push(priceMinParam, priceMaxParam)
        paramCount += 2 // Used 2 params
      }
      // Note: If no transaction_type, we don't filter by price to avoid complex OR logic
    }

    // Filter by area range (schema uses 'area' column, not 'total_area')
    if (area_min) {
      paramCount++
      queryText += ` AND area >= $${paramCount}`
      queryParams.push(area_min)
    }

    if (area_max) {
      paramCount++
      queryText += ` AND area <= $${paramCount}`
      queryParams.push(area_max)
    }

    // Filter by search query (q) - search in name, description, address
    // Schema migration 047 has: name, description, description_full, address, province, ward (no district)
    if (q) {
      paramCount++
      queryText += ` AND (
        name ILIKE $${paramCount} OR 
        COALESCE(description, '') ILIKE $${paramCount} OR 
        COALESCE(description_full, '') ILIKE $${paramCount} OR
        COALESCE(address, '') ILIKE $${paramCount} OR
        province ILIKE $${paramCount} OR
        COALESCE(ward, '') ILIKE $${paramCount}
      )`
      queryParams.push(`%${q}%`)
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
    
    // Store final query for error logging
    finalQueryText = queryText

    const result = await query(queryText, queryParams)

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Properties API] Query:', {
        filters: {
          property_type,
          transaction_type,
          status,
          q,
          province,
        },
        queryText,
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
    console.error('Error fetching properties:', error)
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
      // Log the query that failed if available
      if (finalQueryText) {
        console.error('Failed query:', finalQueryText)
        console.error('Query params:', queryParams)
      }
    }
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch properties', 
      error: error instanceof Error ? error.message : 'Unknown error',
      // Include more details in development
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
        query: finalQueryText || queryText,
        params: queryParams,
      })
    })
  }
})

// GET /api/properties/types - Get all distinct property types (PUBLIC)
// MUST be before /:slug route to avoid route conflict
router.get('/types', async (req, res) => {
  try {
    // Get counts from database
    const result = await query(
      `SELECT type, COUNT(*) as count 
       FROM properties 
       WHERE type IS NOT NULL 
       GROUP BY type`
    )

    // Create a map of type -> count
    const typeCountMap: Record<string, number> = {}
    result.rows.forEach(row => {
      typeCountMap[row.type] = parseInt(row.count)
    })

    // Map all valid property types with their labels
    const typeLabels: Record<string, string> = {
      'nha-pho': 'Nhà phố',
      'can-ho': 'Căn hộ',
      'dat-nen': 'Đất nền',
      'biet-thu': 'Biệt thự',
      'shophouse': 'Shophouse',
      'nha-xuong': 'Nhà xưởng',
    }

    // Return all valid types with their counts (0 if not in DB yet)
    const types = Object.keys(typeLabels).map(value => ({
      value,
      label: typeLabels[value],
      count: typeCountMap[value] || 0,
    }))

    res.json({
      success: true,
      data: types,
    })
  } catch (error) {
    console.error('Error fetching property types:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch property types',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// GET /api/properties/:slug - Get property by slug (PUBLIC)
// MUST be after /types route to avoid route conflict
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    // Get property data
    const propertyResult = await query('SELECT * FROM properties WHERE slug = $1', [slug])

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Property not found' })
    }

    const property = propertyResult.rows[0]

    // Get images for this property
    let imagesResult = { rows: [] }
    try {
      imagesResult = await query(
        'SELECT id, property_id, url, caption, display_order, is_primary, created_at FROM property_images WHERE property_id = $1 ORDER BY display_order ASC, created_at ASC',
        [property.id]
      )
    } catch (err) {
      // Table might not exist, just set empty array
      console.warn('[API] Could not fetch property images:', err)
      imagesResult = { rows: [] }
    }

    // Normalize image URLs: convert backslashes to forward slashes (Windows path to URL)
    const normalizePath = (path: string | null | undefined): string => {
      if (!path) return ''
      return path.replace(/\\/g, '/')
    }
    
    // Normalize thumbnail_url
    if (property.thumbnail_url) {
      property.thumbnail_url = normalizePath(property.thumbnail_url)
    }
    
    // Normalize video_url
    if (property.video_url) {
      property.video_url = normalizePath(property.video_url)
    }
    
    // Normalize image URLs in images array
    const images = (imagesResult?.rows || []).map((img: any) => ({
      ...img,
      url: normalizePath(img.url)
    }))
    
    // Attach normalized images to property data
    property.images = images
    
    // Debug logging
    console.log('[API] Property ID:', property.id)
    console.log('[API] Property name:', property.name)
    console.log('[API] Thumbnail URL (normalized):', property.thumbnail_url)
    console.log('[API] Images found:', property.images.length)
    if (property.images.length > 0) {
      console.log('[API] First image URL (normalized):', property.images[0]?.url)
      console.log('[API] Images data:', JSON.stringify(property.images.slice(0, 2), null, 2))
    }

    res.json({
      success: true,
      data: property,
    })
  } catch (error) {
    console.error('Error fetching property:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch property' })
  }
})

export default router

