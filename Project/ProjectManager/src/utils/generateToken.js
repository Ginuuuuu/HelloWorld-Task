import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token for an authenticated user
 * @param {object} user - User document or payload object
 * @returns {string} Signed JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user._id || user.id,
    role: user.role,
  };

  const secret = process.env.JWT_SECRET || 'fallback_secret_key_only_for_development';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn });
};

export default generateToken;
