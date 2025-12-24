import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getIndustrialParks,
  getIndustrialParkById,
  createIndustrialPark,
  updateIndustrialPark,
  deleteIndustrialPark,
  copyIndustrialPark
} from '../controllers/industrialParkController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/industrial-parks - Get all industrial parks with filters and pagination
router.get('/', getIndustrialParks);

// GET /api/industrial-parks/:id - Get industrial park by ID
router.get('/:id', getIndustrialParkById);

// POST /api/industrial-parks - Create new industrial park
router.post('/', createIndustrialPark);

// PUT /api/industrial-parks/:id - Update industrial park
router.put('/:id', updateIndustrialPark);

// PATCH /api/industrial-parks/:id - Partial update industrial park
router.patch('/:id', updateIndustrialPark);

// DELETE /api/industrial-parks/:id - Delete industrial park
router.delete('/:id', deleteIndustrialPark);

// POST /api/industrial-parks/:id/copy - Copy/duplicate industrial park
router.post('/:id/copy', copyIndustrialPark);

export default router;
