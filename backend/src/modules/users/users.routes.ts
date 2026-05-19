import { Router } from 'express';
import { userController } from './users.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validator';
import { updateProfileSchema } from './users.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.get('/search', userController.searchUsers);
router.get('/blocked', userController.getBlockedUsers);
router.get('/username/:username', userController.getUserByUsername);
router.get('/:id', userController.getUserById);
router.patch('/me', validate(updateProfileSchema), userController.updateProfile);
router.post('/block/:userId', userController.blockUser);
router.delete('/block/:userId', userController.unblockUser);

export default router;
