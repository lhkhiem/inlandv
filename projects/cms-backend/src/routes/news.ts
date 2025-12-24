import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  copyNews
} from '../controllers/newsController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/news - Get all news with filters and pagination
router.get('/', getNews);

// GET /api/news/:id - Get news by ID
router.get('/:id', getNewsById);

// POST /api/news - Create new news
router.post('/', createNews);

// PUT /api/news/:id - Update news
router.put('/:id', updateNews);

// DELETE /api/news/:id - Delete news
router.delete('/:id', deleteNews);

// POST /api/news/:id/copy - Copy/duplicate news
router.post('/:id/copy', copyNews);

export default router;




