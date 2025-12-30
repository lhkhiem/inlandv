import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
} from '../controllers/jobController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/jobs - Get all jobs
router.get('/', getJobs);

// GET /api/jobs/:id - Get job by ID
router.get('/:id', getJobById);

// POST /api/jobs - Create new job
router.post('/', createJob);

// PUT /api/jobs/:id - Update job
router.put('/:id', updateJob);

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', deleteJob);

export default router;


















