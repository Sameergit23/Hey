import multer from 'multer';
import path from 'path';
import { nanoid } from 'nanoid';
import { LIMITS } from '../../config/constants';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${nanoid(10)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: LIMITS.MAX_FILE_SIZE,
  },
});
