import { Router } from 'express';
import {
  getOverdueTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskActivity,
} from '../controllers/taskController.js';
import {
  createComment,
  getTaskComments,
} from '../controllers/commentController.js';
import {
  taskIdParamValidator,
  updateTaskValidator,
} from '../validators/taskValidator.js';
import { createCommentValidator } from '../validators/commentValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireTaskAccess } from '../middleware/projectAccessMiddleware.js';

const router = Router();

// Protect all task routes
router.use(requireAuth);

// Overdue tasks endpoint (must precede /:taskId)
router.get('/overdue', getOverdueTasks);

// Task CRUD
router.get('/:taskId', taskIdParamValidator, requireTaskAccess, getTaskById);
router.patch('/:taskId', taskIdParamValidator, requireTaskAccess, updateTaskValidator, updateTask);
router.delete('/:taskId', taskIdParamValidator, requireTaskAccess, deleteTask);

// Task History / Activity
router.get('/:taskId/activity', taskIdParamValidator, requireTaskAccess, getTaskActivity);

// Task Comments
router.post(
  '/:taskId/comments',
  taskIdParamValidator,
  requireTaskAccess,
  createCommentValidator,
  createComment
);
router.get('/:taskId/comments', taskIdParamValidator, requireTaskAccess, getTaskComments);

export default router;
