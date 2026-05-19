import { Request, Response } from 'express';
import { contactService } from './contacts.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { successResponse } from '../../utils/response';

class ContactController {
  getContacts = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const contacts = await contactService.getContacts(userId);
    return successResponse(res, { contacts }, 'Contacts retrieved');
  });

  addContact = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { contactId, nickname } = req.body;
    const contact = await contactService.addContact(userId, contactId, nickname);
    return successResponse(res, { contact }, 'Contact added', 201);
  });

  removeContact = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    await contactService.removeContact(userId, id);
    return successResponse(res, null, 'Contact removed');
  });

  updateNickname = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { nickname } = req.body;
    const contact = await contactService.updateContactNickname(userId, id, nickname);
    return successResponse(res, { contact }, 'Nickname updated');
  });
}

export const contactController = new ContactController();
