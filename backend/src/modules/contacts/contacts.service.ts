import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
import { ERROR_CODES, HTTP_STATUS } from '../../config/constants';

class ContactService {
  async addContact(userId: string, contactId: string, nickname?: string) {
    // Check if contact exists
    const contact = await prisma.user.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new AppError(
        'User not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    return prisma.contact.upsert({
      where: {
        userId_contactId: { userId, contactId },
      },
      create: {
        userId,
        contactId,
        nickname,
      },
      update: {
        nickname,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            about: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    });
  }

  async removeContact(userId: string, contactId: string) {
    return prisma.contact.delete({
      where: {
        userId_contactId: { userId, contactId },
      },
    });
  }

  async getContacts(userId: string) {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            about: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
      orderBy: {
        contact: {
          name: 'asc',
        },
      },
    });

    return contacts.map((c) => ({
      ...c.contact,
      nickname: c.nickname,
      addedAt: c.createdAt,
    }));
  }

  async updateContactNickname(userId: string, contactId: string, nickname: string) {
    return prisma.contact.update({
      where: {
        userId_contactId: { userId, contactId },
      },
      data: { nickname },
    });
  }
}

export const contactService = new ContactService();
