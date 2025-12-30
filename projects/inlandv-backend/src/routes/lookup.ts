import { Router } from 'express'
import { query } from '../database/db'

const router = Router()

// GET /api/lookup/product-types - Get all product types (PUBLIC)
router.get('/product-types', async (req, res) => {
  try {
    const result = await query(
      `SELECT code, name_vi, name_en, display_order 
       FROM product_types 
       WHERE is_active = true 
       ORDER BY display_order ASC, name_vi ASC`
    )

    res.json({
      success: true,
      data: result.rows.map(row => ({
        code: row.code,
        label: row.name_vi,
        name_vi: row.name_vi,
        name_en: row.name_en,
        display_order: row.display_order,
      })),
    })
  } catch (error) {
    console.error('Error fetching product types:', error)
    // If table doesn't exist, return default product types
    res.json({
      success: true,
      data: [
        { code: 'dat', label: 'Đất', name_vi: 'Đất', name_en: 'Land', display_order: 1 },
        { code: 'nha-xuong', label: 'Nhà xưởng', name_vi: 'Nhà xưởng', name_en: 'Factory', display_order: 2 },
        { code: 'dat-co-nha-xuong', label: 'Đất có nhà xưởng', name_vi: 'Đất có nhà xưởng', name_en: 'Land with Factory', display_order: 3 },
      ],
    })
  }
})

// GET /api/lookup/transaction-types - Get all transaction types (PUBLIC)
router.get('/transaction-types', async (req, res) => {
  try {
    const result = await query(
      `SELECT code, name_vi, name_en, display_order 
       FROM transaction_types 
       WHERE is_active = true 
       ORDER BY display_order ASC, name_vi ASC`
    )

    res.json({
      success: true,
      data: result.rows.map(row => ({
        code: row.code,
        label: row.name_vi,
        name_vi: row.name_vi,
        name_en: row.name_en,
        display_order: row.display_order,
      })),
    })
  } catch (error) {
    console.error('Error fetching transaction types:', error)
    // If table doesn't exist, return default transaction types
    res.json({
      success: true,
      data: [
        { code: 'chuyen-nhuong', label: 'Chuyển nhượng', name_vi: 'Chuyển nhượng', name_en: 'Transfer', display_order: 1 },
        { code: 'cho-thue', label: 'Cho thuê', name_vi: 'Cho thuê', name_en: 'Rent', display_order: 2 },
      ],
    })
  }
})

// GET /api/lookup/location-types - Get all location types (PUBLIC)
router.get('/location-types', async (req, res) => {
  try {
    const result = await query(
      `SELECT code, name_vi, name_en, display_order 
       FROM location_types 
       WHERE is_active = true 
       ORDER BY display_order ASC, name_vi ASC`
    )

    res.json({
      success: true,
      data: result.rows.map(row => ({
        code: row.code,
        label: row.name_vi,
        name_vi: row.name_vi,
        name_en: row.name_en,
        display_order: row.display_order,
      })),
    })
  } catch (error) {
    console.error('Error fetching location types:', error)
    // If table doesn't exist, return default location types
    res.json({
      success: true,
      data: [
        { code: 'trong-kcn', label: 'Trong KCN', name_vi: 'Trong KCN', name_en: 'Inside Industrial Zone', display_order: 1 },
        { code: 'ngoai-kcn', label: 'Ngoài KCN', name_vi: 'Ngoài KCN', name_en: 'Outside Industrial Zone', display_order: 2 },
        { code: 'trong-ccn', label: 'Trong CCN', name_vi: 'Trong CCN', name_en: 'Inside Industrial Cluster', display_order: 3 },
        { code: 'ngoai-ccn', label: 'Ngoài CCN', name_vi: 'Ngoài CCN', name_en: 'Outside Industrial Cluster', display_order: 4 },
        { code: 'ngoai-kcn-ccn', label: 'Ngoài KCN / CCN', name_vi: 'Ngoài KCN / CCN', name_en: 'Outside KCN / CCN', display_order: 5 },
      ],
    })
  }
})

// GET /api/lookup/industries - Get all industries (PUBLIC)
router.get('/industries', async (req, res) => {
  try {
    const result = await query(
      `SELECT code, name_vi, name_en 
       FROM industries 
       ORDER BY name_vi ASC`
    )

    res.json({
      success: true,
      data: result.rows.map(row => ({
        code: row.code,
        label: row.name_vi,
        name_vi: row.name_vi,
        name_en: row.name_en,
      })),
    })
  } catch (error) {
    console.error('Error fetching industries:', error)
    res.json({
      success: true,
      data: [],
    })
  }
})

export default router




