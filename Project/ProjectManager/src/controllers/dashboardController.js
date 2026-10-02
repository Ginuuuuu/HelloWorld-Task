import Task from '../models/Task.js';
import { sendSuccess } from '../utils/apiResponse.js';

/**
 * Get project dashboard statistics
 * GET /api/projects/:projectId/dashboard
 */
export const getProjectDashboard = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const now = new Date();

    // Query non-deleted tasks for the specified project
    const tasks = await Task.find({
      project: projectId,
      deletedAt: null,
    });

    const totalTasks = tasks.length;
    let todo = 0;
    let inProgress = 0;
    let done = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    let overdue = 0;

    for (const task of tasks) {
      // Status breakdown
      if (task.status === 'todo') todo++;
      else if (task.status === 'in-progress') inProgress++;
      else if (task.status === 'done') done++;

      // Priority breakdown
      if (task.priority === 'high') highPriority++;
      else if (task.priority === 'medium') mediumPriority++;
      else if (task.priority === 'low') lowPriority++;

      // Overdue check
      if (task.dueDate && task.dueDate < now && task.status !== 'done') {
        overdue++;
      }
    }

    const completedPercentage = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

    const stats = {
      totalTasks,
      todo,
      inProgress,
      done,
      highPriority,
      mediumPriority,
      lowPriority,
      overdue,
      completedPercentage,
    };

    return sendSuccess(res, 200, 'Project dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};
