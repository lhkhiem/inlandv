import { Router, Request, Response } from 'express'
import { query } from '../database/db'

const router = Router()

// Get all settings (public endpoint)
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY namespace ASC')
    res.json({ success: true, data: result.rows })
  } catch (error: any) {
    // If table doesn't exist, return empty array
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.json({ success: true, data: [] })
    }
    console.error('Failed to fetch settings:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch settings' })
  }
})

// Get setting by namespace (public endpoint)
router.get('/:namespace', async (req: Request, res: Response) => {
  try {
    const { namespace } = req.params
    console.log(`[Settings API] Fetching setting for namespace: ${namespace}`)
    
    const result = await query('SELECT * FROM settings WHERE namespace = $1', [namespace])
    
    if (result.rows.length === 0) {
      console.log(`[Settings API] No setting found for namespace: ${namespace}, returning empty`)
      // Return empty value object instead of 404 to match frontend expectations
      return res.json({ 
        success: true, 
        data: { 
          namespace, 
          value: {} 
        } 
      })
    }
    
    const setting = result.rows[0]
    console.log(`[Settings API] Found setting:`, { 
      namespace: setting.namespace, 
      valueType: typeof setting.value,
      valuePreview: typeof setting.value === 'string' ? setting.value.substring(0, 100) : 'object'
    })
    
    // Parse JSON value if it's a string (PostgreSQL JSONB might return as string)
    if (typeof setting.value === 'string') {
      try {
        setting.value = JSON.parse(setting.value)
        console.log(`[Settings API] Parsed JSON value successfully`)
      } catch (e) {
        console.warn(`[Settings API] Failed to parse JSON value:`, e)
        // If parsing fails, keep as is
      }
    }
    
    console.log(`[Settings API] Returning setting with value keys:`, Object.keys(setting.value || {}))
    res.json({ success: true, data: setting })
  } catch (error: any) {
    // If table doesn't exist, return empty value
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      console.log(`[Settings API] Table doesn't exist, returning empty for namespace: ${req.params.namespace}`)
      return res.json({ 
        success: true, 
        data: { 
          namespace: req.params.namespace, 
          value: {} 
        } 
      })
    }
    console.error('[Settings API] Failed to fetch setting:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch setting' })
  }
})

export default router

