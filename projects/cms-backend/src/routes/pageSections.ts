import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPageSections,
  getPageSectionById,
  createPageSection,
  updatePageSection,
  deletePageSection,
  updatePageSectionsOrder
} from '../controllers/pageSectionController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/page-sections - Create new section (must be before /:page_id)
router.post('/', createPageSection);

// PUT /api/page-sections/:id - Update section (must be before /:page_id)
router.put('/:id', updatePageSection);

// DELETE /api/page-sections/:id - Delete section (DISABLED - sections can only be updated, not deleted)
// router.delete('/:id', deletePageSection);

// POST /api/page-sections/:page_id/order - Update sections order
router.post('/:page_id/order', updatePageSectionsOrder);

// GET /api/page-sections/:page_id - Get all sections for a page (must be last)
router.get('/:page_id', getPageSections);

export default router;

