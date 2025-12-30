// Lookup routes - Get lookup data for filters
import { Router } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/lookup/product-types - Get all industrial park types
router.get('/product-types', async (req, res) => {
  try {
    const query = `SELECT * FROM industrial_park_types WHERE is_active = true ORDER BY display_order ASC, name_vi ASC`;
    const result: any = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[getProductTypes] Error:', error);
    // If table doesn't exist, return default values
    res.json({
      success: true,
      data: [
        { code: 'dat', name_vi: 'Đất', name_en: 'Land', display_order: 1 },
        { code: 'nha-xuong', name_vi: 'Nhà xưởng', name_en: 'Factory', display_order: 2 },
        { code: 'dat-co-nha-xuong', name_vi: 'Đất có nhà xưởng', name_en: 'Land with Factory', display_order: 3 }
      ]
    });
  }
});

// GET /api/lookup/transaction-types - Get all transaction types
router.get('/transaction-types', async (req, res) => {
  try {
    const query = `SELECT * FROM transaction_types WHERE is_active = true ORDER BY display_order ASC, name_vi ASC`;
    const result: any = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[getTransactionTypes] Error:', error);
    // If table doesn't exist, return default values
    res.json({
      success: true,
      data: [
        { code: 'chuyen-nhuong', name_vi: 'Chuyển nhượng', name_en: 'Transfer', display_order: 1 },
        { code: 'cho-thue', name_vi: 'Cho thuê', name_en: 'Rent', display_order: 2 }
      ]
    });
  }
});

// GET /api/lookup/location-types - Get all location types
router.get('/location-types', async (req, res) => {
  try {
    const query = `SELECT * FROM location_types WHERE is_active = true ORDER BY display_order ASC, name_vi ASC`;
    const result: any = await sequelize.query(query, {
      type: QueryTypes.SELECT
    });
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[getLocationTypes] Error:', error);
    // If table doesn't exist, return default values
    res.json({
      success: true,
      data: [
        { code: 'trong-kcn', name_vi: 'Trong KCN', name_en: 'Inside Industrial Zone', display_order: 1 },
        { code: 'ngoai-kcn', name_vi: 'Ngoài KCN', name_en: 'Outside Industrial Zone', display_order: 2 },
        { code: 'trong-ccn', name_vi: 'Trong CCN', name_en: 'Inside Industrial Cluster', display_order: 3 },
        { code: 'ngoai-ccn', name_vi: 'Ngoài CCN', name_en: 'Outside Industrial Cluster', display_order: 4 },
        { code: 'ngoai-kcn-ccn', name_vi: 'Ngoài KCN / CCN', name_en: 'Outside KCN / CCN', display_order: 5 }
      ]
    });
  }
});

export default router;

