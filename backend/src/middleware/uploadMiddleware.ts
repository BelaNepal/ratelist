import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Base Upload Directory for Products Assets
const baseUploadDir = path.join(__dirname, '../../uploads/products');

// Ensure upload directory exists recursively
if (!fs.existsSync(baseUploadDir)) {
  fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Storage Engine with Directory & Subdirectory Handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Optional category subdirectory from query or body
    const categorySubdir = req.body?.category
      ? req.body.category.toLowerCase().replace(/[^a-z0-9]/g, '_')
      : 'general';

    const targetDir = path.join(baseUploadDir, categorySubdir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// File Filter for Images Only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, GIF, and SVG images are allowed!'));
  }
};

export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
