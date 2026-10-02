import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMembers,
} from '../controllers/projectController.js';
import { createTask, getProjectTasks } from '../controllers/taskController.js';
import { getProjectDashboard } from '../controllers/dashboardController.js';
import {
  createProjectValidator,
  updateProjectValidator,
  projectIdParamValidator,
  projectAndUserIdParamsValidator,
} from '../validators/projectValidator.js';
import { createTaskValidator, getTasksQueryValidator } from '../validators/taskValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  requireProjectMember,
  requireProjectOwner,
} from '../middleware/projectAccessMiddleware.js';

const router = Router();

// Protect all project routes with authentication
router.use(requireAuth);

// Project CRUD
router.post('/', createProjectValidator, createProject);
router.get('/', getProjects);
router.get('/:projectId', projectIdParamValidator, requireProjectMember, getProjectById);
router.patch(
  '/:projectId',
  projectIdParamValidator,
  requireProjectOwner,
  updateProjectValidator,
  updateProject
);
router.delete('/:projectId', projectIdParamValidator, requireProjectOwner, deleteProject);

// Project Member Management
router.post(
  '/:projectId/members/:userId',
  projectAndUserIdParamsValidator,
  requireProjectOwner,
  addMember
);
router.delete(
  '/:projectId/members/:userId',
  projectAndUserIdParamsValidator,
  requireProjectOwner,
  removeMember
);
router.get('/:projectId/members', projectIdParamValidator, requireProjectMember, getMembers);

// Project Tasks
router.post(
  '/:projectId/tasks',
  projectIdParamValidator,
  requireProjectMember,
  createTaskValidator,
  createTask
);
router.get(
  '/:projectId/tasks',
  projectIdParamValidator,
  requireProjectMember,
  getTasksQueryValidator,
  getProjectTasks
);

// Project Dashboard
router.get(
  '/:projectId/dashboard',
  projectIdParamValidator,
  requireProjectMember,
  getProjectDashboard
);

export default router;
