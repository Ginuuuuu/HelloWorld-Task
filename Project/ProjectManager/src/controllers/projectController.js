import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Activity from '../models/Activity.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Create a new project
 * POST /api/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;

    const project = await Project.create({
      name,
      description: description || '',
      owner: userId,
      members: [userId], // Owner is automatically a member
    });

    await project.populate('owner', 'name email avatar role');
    await project.populate('members', 'name email avatar role');

    return sendSuccess(res, 201, 'Project created successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all projects accessible to the authenticated user
 * GET /api/projects
 */
export const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let query = {};

    // Admins can view all projects, regular users only view their projects
    if (req.user.role !== 'admin') {
      query = {
        $or: [{ owner: userId }, { members: userId }],
      };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Projects retrieved successfully', { projects });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single project by ID
 * GET /api/projects/:projectId
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    return sendSuccess(res, 200, 'Project retrieved successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project details
 * PATCH /api/projects/:projectId
 */
export const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = req.project; // Attached by requireProjectOwner

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate('owner', 'name email avatar role');
    await project.populate('members', 'name email avatar role');

    return sendSuccess(res, 200, 'Project updated successfully', { project });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete project and cascade delete tasks, comments, and activities
 * DELETE /api/projects/:projectId
 */
export const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.params.projectId;

    // Delete tasks, comments, and activities associated with this project
    await Task.deleteMany({ project: projectId });
    await Comment.deleteMany({ project: projectId });
    await Activity.deleteMany({ project: projectId });

    await Project.findByIdAndDelete(projectId);

    return sendSuccess(res, 200, 'Project and associated resources deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add a member to the project
 * POST /api/projects/:projectId/members/:userId
 */
export const addMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project; // Attached by requireProjectOwner

    // Check if target user exists
    const targetUser = await User.findById(userId).select('name email avatar role');
    if (!targetUser) {
      return sendError(res, 404, 'User to add was not found');
    }

    // Check if user is project owner
    if (project.owner.toString() === userId) {
      return sendError(res, 400, 'User is already the owner of this project');
    }

    // Check if user is already a member
    const isAlreadyMember = project.members.some(
      (m) => (m._id ? m._id.toString() : m.toString()) === userId
    );

    if (isAlreadyMember) {
      return sendError(res, 400, 'User is already a member of this project');
    }

    project.members.push(userId);
    await project.save();

    await project.populate('members', 'name email avatar role');

    return sendSuccess(res, 200, 'Member added to project successfully', {
      addedUser: targetUser,
      members: project.members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from the project
 * DELETE /api/projects/:projectId/members/:userId
 */
export const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project; // Attached by requireProjectOwner

    // Prevent removing the project owner
    if (project.owner.toString() === userId) {
      return sendError(res, 400, 'Cannot remove the project owner from the project');
    }

    // Check if user is currently a member
    const memberIndex = project.members.findIndex(
      (m) => (m._id ? m._id.toString() : m.toString()) === userId
    );

    if (memberIndex === -1) {
      return sendError(res, 400, 'User is not a member of this project');
    }

    // Remove member from array
    project.members.splice(memberIndex, 1);
    await project.save();

    // Unassign tasks in this project currently assigned to this removed member
    await Task.updateMany(
      { project: project._id, assignee: userId },
      { $set: { assignee: null } }
    );

    await project.populate('members', 'name email avatar role');

    return sendSuccess(res, 200, 'Member removed from project successfully', {
      removedUserId: userId,
      members: project.members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all members of a project
 * GET /api/projects/:projectId/members
 */
export const getMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) {
      return sendError(res, 404, 'Project not found');
    }

    return sendSuccess(res, 200, 'Project members retrieved successfully', {
      owner: project.owner,
      members: project.members,
    });
  } catch (error) {
    next(error);
  }
};
