import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';

export const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 150 })
    .withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  handleValidationErrors,
];

export const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  handleValidationErrors,
];

export const projectIdParamValidator = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid Project ID format'),
  handleValidationErrors,
];

export const projectAndUserIdParamsValidator = [
  param('projectId')
    .isMongoId()
    .withMessage('Invalid Project ID format'),
  param('userId')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  handleValidationErrors,
];
