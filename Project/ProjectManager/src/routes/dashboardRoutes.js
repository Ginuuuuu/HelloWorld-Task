import { Router } from 'express';
import { getProjectDashboard } from '../controllers/dashboardController.js';
import { projectIdParamValidator } from '../validators/projectValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireProjectMember } from '../middleware/projectAccessMiddleware.js';

const router = Router();

// Protect all dashboard routes
router.use(requireAuth);

// GET /api/dashboard/:projectId
router.get('/:projectId', projectIdParamValidator, requireProjectMember, getProjectDashboard);

export default router;
