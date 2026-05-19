import { Router } from 'express';
import { presenceController } from './presence.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/online', presenceController.getOnlineUsers);
router.get('/:userId', presenceController.getUserPresence);

export default router;
