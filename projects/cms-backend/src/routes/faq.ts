import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getFAQCategories,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
  getFAQQuestions,
  createFAQQuestion,
  updateFAQQuestion,
  deleteFAQQuestion
} from '../controllers/faqController';

const router = Router();

// FAQ Categories
router.get('/categories', getFAQCategories);
router.post('/categories', authMiddleware, createFAQCategory);
router.put('/categories/:id', authMiddleware, updateFAQCategory);
router.patch('/categories/:id', authMiddleware, updateFAQCategory);
router.delete('/categories/:id', authMiddleware, deleteFAQCategory);

// FAQ Questions
router.get('/questions', getFAQQuestions);
router.post('/questions', authMiddleware, createFAQQuestion);
router.put('/questions/:id', authMiddleware, updateFAQQuestion);
router.patch('/questions/:id', authMiddleware, updateFAQQuestion);
router.delete('/questions/:id', authMiddleware, deleteFAQQuestion);

export default router;






















