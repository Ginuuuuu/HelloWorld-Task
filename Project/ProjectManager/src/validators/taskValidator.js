import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

export const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('assignee')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid assignee user ID'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date string'),
  handleValidationErrors,
];

export const updateTaskValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  body('assignee')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val)) return true;
      throw new Error('Assignee must be a valid MongoDB ObjectId or null');
    }),
  body('dueDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (!isNaN(Date.parse(val))) return true;
      throw new Error('Due date must be a valid date or null');
    }),
  body('restore')
    .optional()
    .isBoolean()
    .withMessage('Restore flag must be a boolean'),
  handleValidationErrors,
];

export const getTasksQueryValidator = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  query('priority')
    .optional()
    .isIn(VALID_PRIORITIES)
    .withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`),
  query('assignee')
    .optional()
    .isMongoId()
    .withMessage('Invalid assignee user ID'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer starting at 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100'),
  handleValidationErrors,
];

export const taskIdParamValidator = [
  param('taskId')
    .isMongoId()
    .withMessage('Invalid Task ID format'),
  handleValidationErrors,
];
