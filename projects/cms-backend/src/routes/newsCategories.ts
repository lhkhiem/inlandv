import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNewsCategories,
  getNewsCategoryById,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory
} from '../controllers/newsCategoryController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/news-categories - Get all news categories
router.get('/', getNewsCategories);

// GET /api/news-categories/:id - Get news category by ID
router.get('/:id', getNewsCategoryById);

// POST /api/news-categories - Create new news category
router.post('/', createNewsCategory);

// PUT /api/news-categories/:id - Update news category
router.put('/:id', updateNewsCategory);

// DELETE /api/news-categories/:id - Delete news category
router.delete('/:id', deleteNewsCategory);

export default router;


















