import { Router } from 'express';
import { callController } from './calls.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/history', callController.getCallHistory);
router.get('/:id', callController.getCallById);

export default router;
