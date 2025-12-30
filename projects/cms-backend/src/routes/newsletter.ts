import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNewsletterSubscriptions,
  subscribeNewsletter,
  unsubscribeNewsletter,
  updateSubscriptionStatus,
  deleteSubscription
} from '../controllers/newsletterController';

const router = Router();

// Public routes (for subscription/unsubscription)
router.post('/subscribe', subscribeNewsletter);
router.post('/unsubscribe', unsubscribeNewsletter);

// Protected routes (admin only)
router.get('/', authMiddleware, getNewsletterSubscriptions);
router.put('/:id/status', authMiddleware, updateSubscriptionStatus);
router.patch('/:id/status', authMiddleware, updateSubscriptionStatus);
router.delete('/:id', authMiddleware, deleteSubscription);

export default router;






















