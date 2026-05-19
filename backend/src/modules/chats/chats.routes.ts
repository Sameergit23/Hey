import { Router } from 'express';
import { chatController } from './chats.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validator';
import { createDirectChatSchema, createGroupChatSchema, updateChatSchema, addMembersSchema, updateSettingsSchema } from './chats.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', chatController.getUserChats);
router.get('/:id', chatController.getChatById);
router.post('/direct', validate(createDirectChatSchema), chatController.createDirectChat);
router.post('/group', validate(createGroupChatSchema), chatController.createGroupChat);
router.patch('/:id', validate(updateChatSchema), chatController.updateChat);
router.post('/:id/members', validate(addMembersSchema), chatController.addMembers);
router.delete('/:id/members/:userId', chatController.removeMember);
router.post('/:id/leave', chatController.leaveChat);
router.patch('/:id/settings', validate(updateSettingsSchema), chatController.updateSettings);
router.post('/:id/clear-unread', chatController.clearUnread);

export default router;
