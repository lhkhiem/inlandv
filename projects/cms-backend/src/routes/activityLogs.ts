import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getActivityLogs,
  getActivityLogById,
  createActivityLog
} from '../controllers/activityLogController';

const router = Router();

// Protected routes (admin only)
router.get('/', authMiddleware, getActivityLogs);
router.get('/:id', authMiddleware, getActivityLogById);
router.post('/', authMiddleware, createActivityLog);

export default router;






