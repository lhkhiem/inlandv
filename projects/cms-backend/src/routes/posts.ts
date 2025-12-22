import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getPosts } from '../controllers/postController';

const router = Router();

// GET /api/posts - Get all posts (public for now, will be protected later)
router.get('/', getPosts);

export default router;

