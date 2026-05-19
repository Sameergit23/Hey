import { Router } from 'express';
import { messageController } from './messages.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validator';
import { sendMessageSchema, editMessageSchema, reactionSchema } from './messages.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/:chatId', messageController.getMessages);
router.post('/', validate(sendMessageSchema), messageController.sendMessage);
router.patch('/:id', validate(editMessageSchema), messageController.editMessage);
router.delete('/:id', messageController.deleteMessage);
router.post('/:id/react', validate(reactionSchema), messageController.addReaction);
router.delete('/:id/react', validate(reactionSchema), messageController.removeReaction);
router.get('/:chatId/search', messageController.searchMessages);

export default router;
