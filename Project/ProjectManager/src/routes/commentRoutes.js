import { Router } from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { commentIdParamValidator } from '../validators/commentValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all comment routes
router.use(requireAuth);

// Delete comment by ID (Author or Admin only)
router.delete('/:commentId', commentIdParamValidator, deleteComment);

export default router;
