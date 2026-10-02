import { sendError } from '../utils/apiResponse.js';

/**
 * Reusable role-based authorization middleware
 * @param  {...string} allowedRoles - Array or list of roles allowed to access the route
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized: Authentication is required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

export default requireRole;
