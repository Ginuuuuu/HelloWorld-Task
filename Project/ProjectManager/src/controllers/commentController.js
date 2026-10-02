import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Create a new comment on a task
 * POST /api/tasks/:taskId/comments
 */
export const createComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const task = req.task; // Attached by requireTaskAccess
    const project = req.project;
    const userId = req.user._id;

    const comment = await Comment.create({
      content,
      task: task._id,
      project: project._id,
      author: userId,
    });

    await comment.populate('author', 'name email avatar role');

    // Log comment activity
    await logActivity({
      taskId: task._id,
      projectId: project._id,
      userId,
      action: 'Comment added',
      description: `${req.user.name} added a comment to task "${task.title}"`,
      metadata: { commentId: comment._id },
    });

    return sendSuccess(res, 201, 'Comment added successfully', { comment });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comments for a task
 * GET /api/tasks/:taskId/comments
 */
export const getTaskComments = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;

    const comments = await Comment.find({ task: taskId })
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 });

    return sendSuccess(res, 200, 'Comments retrieved successfully', {
      total: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a comment
 * DELETE /api/comments/:commentId
 * Rules: Only the author or an admin can delete a comment
 */
export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    const userId = req.user._id.toString();
    const isAuthor = comment.author.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return sendError(res, 403, 'Forbidden: You are not authorized to delete this comment');
    }

    await Comment.findByIdAndDelete(commentId);

    return sendSuccess(res, 200, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};
