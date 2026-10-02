/**
 * Send standard success response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} [data]
 * @param {object} [meta]
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send standard error response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array<any>} [errors]
 */
export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = []) => {
  const response = {
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  };

  return res.status(statusCode).json(response);
};
