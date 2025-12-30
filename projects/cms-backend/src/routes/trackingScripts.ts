import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTrackingScripts,
  getActiveTrackingScripts,
  createTrackingScript,
  updateTrackingScript,
  deleteTrackingScript
} from '../controllers/trackingScriptController';

const router = Router();

// Public route (for frontend to get active scripts)
router.get('/active', getActiveTrackingScripts);

// Protected routes (for managing scripts)
router.get('/', authMiddleware, getTrackingScripts);
router.post('/', authMiddleware, createTrackingScript);
router.put('/:id', authMiddleware, updateTrackingScript);
router.patch('/:id', authMiddleware, updateTrackingScript);
router.delete('/:id', authMiddleware, deleteTrackingScript);

export default router;






















