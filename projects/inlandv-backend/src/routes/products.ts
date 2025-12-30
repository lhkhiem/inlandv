import { Router } from 'express'
import { query } from '../database/db'
import { enrichProductsWithVietnamese, enrichProductWithVietnamese } from '../utils/lookupMapper'

const router = Router()

// GET /api/products - Get all products (PUBLIC)
router.get('/', async (req, res) => {
  try {
    const {
      location_types, // Array of location type codes: ['trong-kcn', 'ngoai-kcn', 'trong-ccn', 'ngoai-ccn', 'ngoai-kcn-ccn']
      has_rental,
      has_transfer,
      has_factory,
      province,
      district,
      rental_price_min,
      rental_price_max,
      transfer_price_min,
      transfer_price_max,
      available_area_min,
      available_area_max,
      q, // Search query
      page = 1,
      limit = 12,
    } = req.query

    let queryText = 'SELECT * FROM products WHERE 1=1'
    const queryParams: any[] = []
    let paramCount = 0
    let finalQueryText = '' // For error logging

    // Filter by location_types (array field)
    if (location_types) {
      const locationTypesArray = Array.isArray(location_types) ? location_types : [location_types]
      if (locationTypesArray.length > 0) {
        // Use PostgreSQL array overlap operator (&&) to check if location_types array contains any of the filter values
        paramCount++
        queryText += ` AND location_types && $${paramCount}::TEXT[]`
        queryParams.push(locationTypesArray)
      }
    }

    // Filter by has_rental
    if (has_rental !== undefined) {
      paramCount++
      queryText += ` AND has_rental = $${paramCount}`
      const hasRentalStr = String(has_rental).toLowerCase()
      const hasRentalValue = hasRentalStr === 'true' || hasRentalStr === '1'
      queryParams.push(hasRentalValue)
    }

    // Filter by has_transfer
    if (has_transfer !== undefined) {
      paramCount++
      queryText += ` AND has_transfer = $${paramCount}`
      const hasTransferStr = String(has_transfer).toLowerCase()
      const hasTransferValue = hasTransferStr === 'true' || hasTransferStr === '1'
      queryParams.push(hasTransferValue)
    }

    // Filter by has_factory
    if (has_factory !== undefined) {
      paramCount++
      queryText += ` AND has_factory = $${paramCount}`
      const hasFactoryStr = String(has_factory).toLowerCase()
      const hasFactoryValue = hasFactoryStr === 'true' || hasFactoryStr === '1'
      queryParams.push(hasFactoryValue)
    }

    // Filter by province
    if (province) {
      paramCount++
      queryText += ` AND province ILIKE $${paramCount}`
      queryParams.push(`%${province}%`)
    }

    // Filter by district
    if (district) {
      paramCount++
      queryText += ` AND district ILIKE $${paramCount}`
      queryParams.push(`%${district}%`)
    }

    // Filter by rental price range
    if (rental_price_min || rental_price_max) {
      const rentalMinParam = rental_price_min || 0
      const rentalMaxParam = rental_price_max || 999999999999
      queryText += ` AND (
        (rental_price_min IS NOT NULL AND rental_price_max IS NOT NULL AND rental_price_min <= $${paramCount + 2} AND rental_price_max >= $${paramCount + 1}) OR
        (rental_price_min IS NOT NULL AND rental_price_max IS NULL AND rental_price_min <= $${paramCount + 2}) OR
        (rental_price_min IS NULL AND rental_price_max IS NOT NULL AND rental_price_max >= $${paramCount + 1})
      )`
      queryParams.push(rentalMinParam, rentalMaxParam)
      paramCount += 2
    }

    // Filter by transfer price range
    if (transfer_price_min || transfer_price_max) {
      const transferMinParam = transfer_price_min || 0
      const transferMaxParam = transfer_price_max || 999999999999
      queryText += ` AND (
        (transfer_price_min IS NOT NULL AND transfer_price_max IS NOT NULL AND transfer_price_min <= $${paramCount + 2} AND transfer_price_max >= $${paramCount + 1}) OR
        (transfer_price_min IS NOT NULL AND transfer_price_max IS NULL AND transfer_price_min <= $${paramCount + 2}) OR
        (transfer_price_min IS NULL AND transfer_price_max IS NOT NULL AND transfer_price_max >= $${paramCount + 1})
      )`
      queryParams.push(transferMinParam, transferMaxParam)
      paramCount += 2
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

    // Filter by search query (q) - search in name, description, address
    if (q) {
      paramCount++
      queryText += ` AND (
        name ILIKE $${paramCount} OR 
        COALESCE(description, '') ILIKE $${paramCount} OR 
        COALESCE(description_full, '') ILIKE $${paramCount} OR
        COALESCE(address, '') ILIKE $${paramCount} OR
        province ILIKE $${paramCount} OR
        COALESCE(district, '') ILIKE $${paramCount} OR
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

    // Log raw data before enrichment - ALWAYS log, not just in development
    if (result.rows.length > 0) {
      console.log('[Products API] Raw data sample (first product):', {
        id: result.rows[0].id,
        name: result.rows[0].name,
        province: result.rows[0].province,
        district: result.rows[0].district,
        contact_phone: result.rows[0].contact_phone,
        provinceType: typeof result.rows[0].province,
        provinceValue: result.rows[0].province,
        allProvinceValues: result.rows.map((r: any) => ({ id: r.id, name: r.name, province: r.province, contact_phone: r.contact_phone })),
      })
    } else {
      console.log('[Products API] No products found')
    }

    // Enrich products với tiếng Việt
    const enrichedProducts = await enrichProductsWithVietnamese(result.rows)

    // Log enriched data - ALWAYS log, not just in development
    if (enrichedProducts.length > 0) {
      console.log('[Products API] Enriched data sample (first product):', {
        id: enrichedProducts[0].id,
        name: enrichedProducts[0].name,
        province: enrichedProducts[0].province,
        district: enrichedProducts[0].district,
        contact_phone: enrichedProducts[0].contact_phone,
        provinceType: typeof enrichedProducts[0].province,
        provinceValue: enrichedProducts[0].province,
        allProvinceValues: enrichedProducts.map((p: any) => ({ id: p.id, name: p.name, province: p.province, contact_phone: p.contact_phone })),
      })
    }

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Products API] Query:', {
        filters: {
          location_types,
          has_rental,
          has_transfer,
          has_factory,
          province,
          q,
        },
        total,
        returned: result.rows.length,
      })
    }

    res.json({
      success: true,
      data: enrichedProducts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
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
      message: 'Failed to fetch products', 
      error: error instanceof Error ? error.message : 'Unknown error',
      // Include more details in development
      ...(process.env.NODE_ENV === 'development' && {
        stack: error instanceof Error ? error.stack : undefined,
      })
    })
  }
})

// GET /api/products/:slug - Get product by slug (PUBLIC)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params

    // Get product data
    const productResult = await query('SELECT * FROM products WHERE slug = $1', [slug])

    if (productResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const product = productResult.rows[0]

    // Enrich product với tiếng Việt
    const enrichedProduct = await enrichProductWithVietnamese(product)

    res.json({
      success: true,
      data: enrichedProduct,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch product' })
  }
})

export default router

