import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPageMetadata,
  getPageMetadataByPath,
  createPageMetadata,
  updatePageMetadata,
  deletePageMetadata
} from '../controllers/pageMetadataController';

const router = Router();

// Public routes (for reading metadata)
router.get('/', getPageMetadata);
router.get('/path/:path', getPageMetadataByPath);

// Protected routes (for managing metadata)
router.post('/', authMiddleware, createPageMetadata);
router.put('/path/:path', authMiddleware, updatePageMetadata);
router.patch('/path/:path', authMiddleware, updatePageMetadata);
router.delete('/path/:path', authMiddleware, deletePageMetadata);

export default router;






















