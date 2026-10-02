import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Middleware ensuring the authenticated user is a member or owner of the project (or admin)
 */
export const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return sendError(res, 400, 'Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (m) => (m._id ? m._id.toString() : m.toString()) === userId
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
      return sendError(res, 403, 'Forbidden: You do not have access to this project');
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring the authenticated user is the owner of the project (or admin)
 */
export const requireProjectOwner = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return sendError(res, 400, 'Invalid project ID format');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 403, 'Forbidden: Only the project owner can perform this action');
    }

    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware ensuring the authenticated user has access to a task via its parent project
 */
export const requireTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;

    if (!taskId || !mongoose.Types.ObjectId.isValid(taskId)) {
      return sendError(res, 400, 'Invalid task ID format');
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    const project = await Project.findById(task.project);
    if (!project) {
      return sendError(res, 404, 'Associated project not found');
    }

    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(
      (m) => (m._id ? m._id.toString() : m.toString()) === userId
    );
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isMember && !isAdmin) {
      return sendError(res, 403, 'Forbidden: You do not have access to this task');
    }

    // Check soft delete status
    if (task.deletedAt && !isAdmin && !isOwner) {
      if (req.body?.restore !== true) {
        return sendError(res, 404, 'Task not found or has been deleted');
      }
    }

    req.task = task;
    req.project = project;
    next();
  } catch (error) {
    next(error);
  }
};
