import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getRealEstates,
  getRealEstateById,
  createRealEstate,
  updateRealEstate,
  deleteRealEstate,
  copyProperty
} from '../controllers/realEstateController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/properties - Get all properties with filters and pagination
router.get('/', getRealEstates);

// GET /api/properties/:id - Get property by ID
router.get('/:id', getRealEstateById);

// POST /api/properties - Create new property
router.post('/', createRealEstate);

// PUT /api/properties/:id - Update property
router.put('/:id', updateRealEstate);

// PATCH /api/properties/:id - Partial update property
router.patch('/:id', updateRealEstate);

// DELETE /api/properties/:id - Delete property
router.delete('/:id', deleteRealEstate);

// POST /api/properties/:id/copy - Copy/duplicate property
router.post('/:id/copy', copyProperty);

export default router;


