import { Router } from 'express';
import { uploadController } from './uploads.controller';
import { authenticate } from '../../middleware/authenticate';
import { uploadLimiter } from '../../middleware/rateLimiter';
import { upload } from './uploads.config';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(uploadLimiter);

router.post('/image', upload.single('file'), uploadController.uploadImage);
router.post('/video', upload.single('file'), uploadController.uploadVideo);
router.post('/audio', upload.single('file'), uploadController.uploadAudio);
router.post('/document', upload.single('file'), uploadController.uploadDocument);

export default router;
