import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';

export const createCommentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 2000 })
    .withMessage('Comment content cannot exceed 2000 characters'),
  handleValidationErrors,
];

export const commentIdParamValidator = [
  param('commentId')
    .isMongoId()
    .withMessage('Invalid Comment ID format'),
  handleValidationErrors,
];
