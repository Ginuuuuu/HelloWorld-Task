import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches the user document to req.user
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, 'Authentication token is missing. Please provide a Bearer token in the Authorization header.');
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_key_only_for_development';
    let decoded;

    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token has expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid authentication token.');
    }

    // Find user in DB (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return sendError(res, 401, 'The user belonging to this token no longer exists.');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireAuth;
