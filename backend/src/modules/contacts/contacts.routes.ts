import { Router } from 'express';
import { contactController } from './contacts.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validator';
import { addContactSchema, updateNicknameSchema } from './contacts.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', contactController.getContacts);
router.post('/', validate(addContactSchema), contactController.addContact);
router.delete('/:id', contactController.removeContact);
router.patch('/:id', validate(updateNicknameSchema), contactController.updateNickname);

export default router;
