import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Create a new task in a project
 * POST /api/projects/:projectId/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignee, dueDate } = req.body;
    const project = req.project; // Attached by requireProjectMember
    const userId = req.user._id;

    // Validate assignee is a member or owner of the project
    if (assignee) {
      const isMember = project.hasMember(assignee);
      if (!isMember) {
        return sendError(
          res,
          400,
          'Validation failed',
          [{ field: 'assignee', message: 'Assignee must be an active member of this project' }]
        );
      }
    }

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      project: project._id,
      createdBy: userId,
      dueDate: dueDate || null,
    });

    await task.populate('assignee', 'name email avatar role');
    await task.populate('createdBy', 'name email avatar role');

    // Log Activity
    await logActivity({
      taskId: task._id,
      projectId: project._id,
      userId,
      action: 'Task created',
      description: `Task "${task.title}" was created by ${req.user.name}`,
      metadata: {
        status: task.status,
        priority: task.priority,
        assignee: task.assignee ? task.assignee._id : null,
      },
    });

    return sendSuccess(res, 201, 'Task created successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for a project with filtering, search, and pagination
 * GET /api/projects/:projectId/tasks
 */
export const getProjectTasks = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const { status, priority, assignee, search, includeDeleted } = req.query;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const query = {
      project: projectId,
    };

    // Soft deletion filter: exclude deleted tasks by default
    if (includeDeleted === 'true' && (req.user.role === 'admin' || req.project.isOwner(req.user._id))) {
      // Allow viewing deleted tasks if authorized
    } else {
      query.deletedAt = null;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Assignee filter
    if (assignee) {
      query.assignee = assignee;
    }

    // Case-insensitive search on title and description
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email avatar role')
        .populate('createdBy', 'name email avatar role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(
      res,
      200,
      'Tasks retrieved successfully',
      { tasks },
      {
        page,
        limit,
        total,
        totalPages,
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:taskId
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('assignee', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .populate('project', 'name description owner');

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // If soft-deleted and user is not admin, deny/not found
    if (task.deletedAt && req.user.role !== 'admin') {
      return sendError(res, 404, 'Task has been deleted');
    }

    return sendSuccess(res, 200, 'Task retrieved successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * Update task details with granular activity logging
 * PATCH /api/tasks/:taskId
 */
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignee, dueDate, restore } = req.body;
    const task = req.task; // Attached by requireTaskAccess
    const project = req.project;
    const userId = req.user._id;

    // Handle restoration from soft deletion
    if (restore === true && task.deletedAt !== null) {
      task.deletedAt = null;
      await task.save();

      await logActivity({
        taskId: task._id,
        projectId: project._id,
        userId,
        action: 'Task restored',
        description: `Task "${task.title}" was restored by ${req.user.name}`,
      });

      await task.populate('assignee', 'name email avatar role');
      await task.populate('createdBy', 'name email avatar role');

      return sendSuccess(res, 200, 'Task restored successfully', { task });
    }

    // Prevent updates if task is deleted and restore flag is not true
    if (task.deletedAt !== null) {
      return sendError(res, 400, 'Cannot update a deleted task. Restore it first.');
    }

    // Validate assignee if being changed
    if (assignee !== undefined) {
      if (assignee !== null && assignee !== '') {
        const isMember = project.hasMember(assignee);
        if (!isMember) {
          return sendError(
            res,
            400,
            'Validation failed',
            [{ field: 'assignee', message: 'Assignee must be an active member of this project' }]
          );
        }
      }
    }

    const activitiesToLog = [];

    // Check status change
    if (status !== undefined && status !== task.status) {
      activitiesToLog.push({
        action: 'Task status changed',
        description: `Status changed from "${task.status}" to "${status}"`,
        metadata: { oldStatus: task.status, newStatus: status },
      });
      task.status = status;
    }

    // Check priority change
    if (priority !== undefined && priority !== task.priority) {
      activitiesToLog.push({
        action: 'Task priority changed',
        description: `Priority changed from "${task.priority}" to "${priority}"`,
        metadata: { oldPriority: task.priority, newPriority: priority },
      });
      task.priority = priority;
    }

    // Check assignee change
    const oldAssigneeId = task.assignee ? task.assignee.toString() : null;
    const newAssigneeId = assignee || null;
    if (assignee !== undefined && oldAssigneeId !== newAssigneeId) {
      let assigneeName = 'unassigned';
      if (newAssigneeId) {
        const u = await User.findById(newAssigneeId).select('name');
        assigneeName = u ? u.name : newAssigneeId;
      }
      activitiesToLog.push({
        action: 'Task assigned',
        description: `Task assigned to ${assigneeName}`,
        metadata: { oldAssignee: oldAssigneeId, newAssignee: newAssigneeId },
      });
      task.assignee = newAssigneeId;
    }

    // Check description change
    if (description !== undefined && description !== task.description) {
      activitiesToLog.push({
        action: 'Task description updated',
        description: `Task description was updated`,
      });
      task.description = description;
    }

    // Check title change
    if (title !== undefined && title !== task.title) {
      activitiesToLog.push({
        action: 'Task title updated',
        description: `Task title changed from "${task.title}" to "${title}"`,
        metadata: { oldTitle: task.title, newTitle: title },
      });
      task.title = title;
    }

    // Check dueDate change
    if (dueDate !== undefined) {
      const newDueDate = dueDate ? new Date(dueDate) : null;
      const oldDueDate = task.dueDate ? new Date(task.dueDate).toISOString() : null;
      if (newDueDate?.toISOString() !== oldDueDate) {
        activitiesToLog.push({
          action: 'Task due date updated',
          description: `Task due date was updated`,
          metadata: { oldDueDate, newDueDate },
        });
        task.dueDate = newDueDate;
      }
    }

    await task.save();

    // Log all recorded activities
    for (const act of activitiesToLog) {
      await logActivity({
        taskId: task._id,
        projectId: project._id,
        userId,
        action: act.action,
        description: act.description,
        metadata: act.metadata,
      });
    }

    await task.populate('assignee', 'name email avatar role');
    await task.populate('createdBy', 'name email avatar role');

    return sendSuccess(res, 200, 'Task updated successfully', { task });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft delete a task
 * DELETE /api/tasks/:taskId
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = req.task; // Attached by requireTaskAccess
    const project = req.project;
    const userId = req.user._id;

    if (task.deletedAt !== null) {
      return sendError(res, 400, 'Task is already deleted');
    }

    task.deletedAt = new Date();
    await task.save();

    await logActivity({
      taskId: task._id,
      projectId: project._id,
      userId,
      action: 'Task deleted',
      description: `Task "${task.title}" was soft-deleted by ${req.user.name}`,
    });

    return sendSuccess(res, 200, 'Task deleted successfully', {
      deletedAt: task.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task activity audit history
 * GET /api/tasks/:taskId/activity
 */
export const getTaskActivity = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;

    const activities = await Activity.find({ task: taskId })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 }); // Chronological order as requested in Section 15

    return sendSuccess(res, 200, 'Task activity retrieved successfully', {
      activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overdue tasks across projects accessible to the authenticated user
 * GET /api/tasks/overdue
 */
export const getOverdueTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let projectFilter = {};

    // Regular users can only see tasks in projects they belong to
    if (req.user.role !== 'admin') {
      const userProjects = await Project.find({
        $or: [{ owner: userId }, { members: userId }],
      }).select('_id');

      const projectIds = userProjects.map((p) => p._id);
      projectFilter = { project: { $in: projectIds } };
    }

    const now = new Date();

    const overdueTasks = await Task.find({
      ...projectFilter,
      dueDate: { $lt: now },
      status: { $ne: 'done' },
      deletedAt: null,
    })
      .populate('project', 'name owner')
      .populate('assignee', 'name email avatar role')
      .populate('createdBy', 'name email avatar role')
      .sort({ dueDate: 1 });

    return sendSuccess(res, 200, 'Overdue tasks retrieved successfully', {
      total: overdueTasks.length,
      tasks: overdueTasks,
    });
  } catch (error) {
    next(error);
  }
};
