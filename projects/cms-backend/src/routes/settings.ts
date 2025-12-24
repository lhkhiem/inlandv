import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getSettings,
  getSettingByNamespace,
  upsertSetting,
  updateSetting,
  deleteSetting,
  clearCache,
  resetDefaults
} from '../controllers/settingController';

const router = Router();

// Public routes (for reading settings)
router.get('/', getSettings);

// Additional protected routes (must be before /:namespace to avoid route conflicts)
router.post('/clear-cache', authMiddleware, clearCache);
router.post('/reset-default', authMiddleware, resetDefaults);

// Namespace-based routes (must be after specific routes)
router.get('/:namespace', getSettingByNamespace);

// Protected routes (for managing settings)
router.post('/', authMiddleware, upsertSetting);
router.put('/:namespace', authMiddleware, updateSetting);
router.patch('/:namespace', authMiddleware, updateSetting);
router.delete('/:namespace', authMiddleware, deleteSetting);

export default router;






