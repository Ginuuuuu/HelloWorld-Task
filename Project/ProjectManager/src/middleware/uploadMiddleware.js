import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Allowed MIME types and extensions for avatars
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

// Ensure target upload directory exists
const uploadDir = path.join(process.cwd(), 'src', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id.toString() : 'guest';
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
  },
});

// File filter restricting only safe image types
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    const err = new Error('Invalid file type. Only image files (JPEG, PNG, WEBP, GIF) are allowed.');
    err.statusCode = 400;
    return cb(err, false);
  }

  cb(null, true);
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024; // 2 MB default

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
  },
  fileFilter,
});

export default uploadAvatar;
