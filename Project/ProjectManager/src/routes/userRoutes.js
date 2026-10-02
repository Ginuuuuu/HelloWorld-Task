import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController.js';
import { updateProfileValidator } from '../validators/userValidator.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadAvatar as uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = Router();

// Protect all user routes
router.use(requireAuth);

router.get('/me', getProfile);
router.patch('/me', updateProfileValidator, updateProfile);
router.post('/me/avatar', uploadMiddleware.single('avatar'), uploadAvatar);

export default router;
