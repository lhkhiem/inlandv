import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getTopics } from '../controllers/topicController';

const router = Router();

// GET /api/topics - Get all topics (public for now, will be protected later)
router.get('/', getTopics);

export default router;

