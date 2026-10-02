import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * Get current user profile
 * GET /api/users/me
 */
export const getProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, 200, 'User profile retrieved successfully', {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 * PATCH /api/users/me
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, email } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });
      if (emailExists) {
        return sendError(res, 409, 'Email address is already in use by another account');
      }
      user.email = email.toLowerCase();
    }

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload and update user avatar
 * POST /api/users/me/avatar
 */
export const uploadAvatar = async (req, res, next) => {
  try {
    let avatarUrl = null;
    let fileInfo = null;

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
      fileInfo = {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      };
    } else if (req.body && (req.body.avatar || req.body.avatarUrl)) {
      avatarUrl = req.body.avatar || req.body.avatarUrl;
      fileInfo = {
        filename: 'provided_url',
        mimetype: 'image/png',
        size: 0,
      };
    } else {
      return sendError(
        res,
        400,
        'Please upload an image file (JPEG, PNG, WEBP, GIF) under field "avatar" or provide an "avatar" URL in JSON body'
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { returnDocument: 'after', runValidators: true }
    );

    return sendSuccess(res, 200, 'Avatar uploaded successfully', {
      avatarUrl,
      fileInfo,
      user,
    });
  } catch (error) {
    next(error);
  }
};
