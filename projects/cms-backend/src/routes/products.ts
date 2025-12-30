import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/products - Get all products with filters and pagination
router.get('/', getProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// POST /api/products - Create new product
router.post('/', createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', updateProduct);

// PATCH /api/products/:id - Partial update product
router.patch('/:id', updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', deleteProduct);

export default router;















