import multer from 'multer';

/**
 * Centralized application error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
    errors = [{ field: err.path, message: `Invalid ID '${err.value}'` }];
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value '${val}' entered for ${field}. It must be unique.`;
    errors = [{ field, message }];
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Authorization denied.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // Handle Multer file upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large. Maximum allowed size is 2MB.';
    } else {
      message = `File upload error: ${err.message}`;
    }
    errors = [{ field: err.field || 'file', message }];
  }

  // Log error on server (never leak stack trace in production)
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error Handler] ${statusCode} - ${message}:`, err.stack || err);
  }

  const response = {
    success: false,
    message,
    errors: errors.length > 0 ? errors : undefined,
  };

  // Only include stack trace if explicitly in development and requested
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
