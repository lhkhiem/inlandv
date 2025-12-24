import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage
} from '../controllers/pageController';

const router = Router();

// GET /api/pages - Get all pages (public, no auth for slug endpoint)
router.get('/slug/:slug', getPageBySlug);

// All other routes require authentication
router.use(authMiddleware);

// GET /api/pages - Get all pages
router.get('/', getPages);

// GET /api/pages/:id - Get page by ID
router.get('/:id', getPageById);

// POST /api/pages - Create new page
router.post('/', createPage);

// PUT /api/pages/:id - Update page
router.put('/:id', updatePage);

// DELETE /api/pages/:id - Delete page (DISABLED - pages can only be updated, not deleted)
// router.delete('/:id', deletePage);

export default router;


