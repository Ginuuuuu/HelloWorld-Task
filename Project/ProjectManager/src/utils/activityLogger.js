import Activity from '../models/Activity.js';

/**
 * Log task activity event
 * @param {object} params
 * @param {string|import('mongoose').Types.ObjectId} params.taskId
 * @param {string|import('mongoose').Types.ObjectId} params.projectId
 * @param {string|import('mongoose').Types.ObjectId} params.userId
 * @param {string} params.action - e.g. 'Task created', 'Task status changed'
 * @param {string} params.description - Human-readable description
 * @param {object} [params.metadata] - Extra details such as previous and new values
 */
export const logActivity = async ({ taskId, projectId, userId, action, description, metadata = {} }) => {
  try {
    const activity = await Activity.create({
      task: taskId,
      project: projectId,
      user: userId,
      action,
      description,
      metadata,
    });
    return activity;
  } catch (error) {
    console.error(`[Activity Logger Error] Failed to log activity "${action}": ${error.message}`);
    // Non-blocking for the primary operation
    return null;
  }
};

export default logActivity;
