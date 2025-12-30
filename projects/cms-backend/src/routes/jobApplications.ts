import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication
} from '../controllers/jobApplicationController';

const router = Router();

// POST /api/job-applications - Create new job application (public, no auth)
router.post('/', createJobApplication);

// All other routes require authentication
router.use(authMiddleware);

// GET /api/job-applications - Get all job applications
router.get('/', getJobApplications);

// GET /api/job-applications/:id - Get job application by ID
router.get('/:id', getJobApplicationById);

// PUT /api/job-applications/:id - Update job application
router.put('/:id', updateJobApplication);

// DELETE /api/job-applications/:id - Delete job application
router.delete('/:id', deleteJobApplication);

export default router;


















