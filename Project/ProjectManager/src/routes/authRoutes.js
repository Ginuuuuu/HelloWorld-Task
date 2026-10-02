import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

// Registration endpoint with rate limiting and validation
router.post('/register', authRateLimiter, registerValidator, register);

// Login endpoint with rate limiting and validation
router.post('/login', authRateLimiter, loginValidator, login);

// Current user profile endpoint
router.get('/me', requireAuth, getMe);

export default router;
